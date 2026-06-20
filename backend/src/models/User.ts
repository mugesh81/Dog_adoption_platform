import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  SHELTER = 'shelter',
  DONOR = 'donor',
  ADOPTER = 'adopter',
  VET = 'vet'
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  address?: string;
  isVerified: boolean;
  profileImageUrl?: string;
  // Password reset
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  // Shelter specific
  shelterRegistrationNumber?: string;
  // Adopter specific
  experience?: string;
  homeType?: 'apartment' | 'house' | 'farm';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.ADOPTER },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  isVerified: { type: Boolean, default: false },
  profileImageUrl: { type: String },
  
  // Password reset
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  
  // Shelter specific fields
  shelterRegistrationNumber: { type: String, trim: true },
  
  // Adopter specific fields
  experience: { type: String, trim: true },
  homeType: { type: String, enum: ['apartment', 'house', 'farm'] },
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);
