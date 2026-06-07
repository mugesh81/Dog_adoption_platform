import mongoose, { Document, Schema } from 'mongoose';

export interface IDonor extends Document {
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

const DonorSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true, minlength: 2 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
}, { timestamps: true });

export const Donor = mongoose.model<IDonor>('Donor', DonorSchema);
