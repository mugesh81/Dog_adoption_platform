import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, UserRole } from '../models/User';

const PUBLIC_REGISTER_ROLES: UserRole[] = [UserRole.ADOPTER, UserRole.DONOR, UserRole.SHELTER];

const generateToken = (id: string, role: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');
  return jwt.sign({ id, role }, secret, {
    expiresIn: '30d',
  });
};

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { name, email: rawEmail, password, role, phone, address, experience, homeType, shelterRegistrationNumber } = req.body;
      const email = rawEmail?.trim().toLowerCase();

      if (!password || password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      }

      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      const resolvedRole = PUBLIC_REGISTER_ROLES.includes(role) ? role : UserRole.ADOPTER;

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email,
        passwordHash,
        role: resolvedRole,
        phone,
        address,
        experience,
        homeType,
        shelterRegistrationNumber
      });

      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id as string, user.role),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email: rawEmail, password } = req.body;
      const email = rawEmail?.trim().toLowerCase();

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id as string, user.role),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      const user = await User.findById((req as any).user.id).select('-passwordHash');
      res.json({ success: true, data: user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
      }

      // BUG-04 FIX: Use a single uniform response message regardless of whether email exists
      const GENERIC_MESSAGE = 'If that email exists, a password reset link has been sent';

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        // Same structure as the success path — no enumeration possible
        return res.json({
          success: true,
          message: GENERIC_MESSAGE,
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
      await user.save();

      // In dev mode, include the reset URL in the response (no email service needed)
      const isDev = process.env.NODE_ENV !== 'production';
      if (isDev) {
        return res.json({
          success: true,
          message: GENERIC_MESSAGE,
          // Dev-only fields — strip in production
          _dev_resetToken: resetToken,
          _dev_resetUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`,
        });
      }

      // TODO: send email in production
      res.json({ success: true, message: GENERIC_MESSAGE });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ 
          success: false, 
          message: 'Token and new password are required' 
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ 
          success: false, 
          message: 'Password must be at least 6 characters' 
        });
      }

      // Hash the token to compare with stored hash
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Find user with valid token
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() },
      });

      if (!user) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid or expired reset token' 
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.passwordHash = await bcrypt.hash(newPassword, salt);

      // Clear reset token fields
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      res.json({
        success: true,
        message: 'Password reset successful. You can now login with your new password',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
