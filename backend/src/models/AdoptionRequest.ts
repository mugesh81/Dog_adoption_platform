import mongoose, { Document, Schema } from 'mongoose';

export interface IAdoptionRequest extends Document {
  dogId: mongoose.Types.ObjectId;
  adopterName: string;
  adopterEmail: string;
  adopterPhone: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const AdoptionRequestSchema: Schema = new Schema({
  dogId: { type: mongoose.Schema.Types.ObjectId, ref: 'DogLegacy', required: true },
  adopterName: { type: String, required: true, trim: true },
  adopterEmail: { type: String, required: true, trim: true, lowercase: true },
  adopterPhone: { type: String, required: true, trim: true },
  message: { type: String, trim: true, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
}, { timestamps: true });

export const AdoptionRequest = mongoose.model<IAdoptionRequest>('AdoptionRequest', AdoptionRequestSchema);
