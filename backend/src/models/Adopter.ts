import mongoose, { Document, Schema } from 'mongoose';

export interface IAdopter extends Document {
  name: string;
  email: string;
  phone: string;
  address: string;
  experience: string;
  homeType: 'apartment' | 'house' | 'farm';
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdopterSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true, minlength: 2 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  experience: { type: String, required: true, trim: true },
  homeType: { type: String, required: true, enum: ['apartment', 'house', 'farm'] },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

export const Adopter = mongoose.model<IAdopter>('Adopter', AdopterSchema);
