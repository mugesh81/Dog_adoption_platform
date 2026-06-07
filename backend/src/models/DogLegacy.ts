import mongoose, { Document, Schema } from 'mongoose';

export interface IDogLegacy extends Document {
  name: string;
  breed: string;
  age: number;
  health: string;
  vaccinated: boolean;
  location: string;
  description: string;
  donorId: mongoose.Types.ObjectId;
  adopted: boolean;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DogLegacySchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  breed: { type: String, required: true, trim: true },
  age: { type: Number, required: true, min: 0, max: 30 },
  health: { type: String, default: 'Healthy', enum: ['Healthy', 'Minor Care Required', 'Special Needs'] },
  vaccinated: { type: Boolean, default: false },
  location: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true, minlength: 10 },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
  adopted: { type: Boolean, default: false },
  imageUrl: { type: String },
}, { timestamps: true });

// Use a distinct collection name so it doesn't clash with the new Dog model
export const DogLegacy = mongoose.model<IDogLegacy>('DogLegacy', DogLegacySchema);
