import mongoose, { Document, Schema } from 'mongoose';

export interface IDog extends Document {
  name: string;
  age: number; // in months
  breed: string;
  healthStatus: 'Healthy' | 'Minor Care Required' | 'Special Needs';
  vaccinated: boolean;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
  };
  description: string;
  media: {
    url: string;
    type: 'image' | 'video';
  }[];
  listedBy: mongoose.Types.ObjectId; // User (Donor/Shelter)
  adopted: boolean;
  adoptedBy?: mongoose.Types.ObjectId; // User (Adopter)
  temperament: string[];
  trainingStatus: 'None' | 'Basic' | 'Advanced';
  specialNeedsDescription?: string;
  adoptionUrgency: 'Normal' | 'High' | 'Critical';
  gender: 'Male' | 'Female';
  size: 'Small' | 'Medium' | 'Large' | 'Extra Large';
  createdAt: Date;
  updatedAt: Date;
}

const DogSchema: Schema = new Schema({
  name: { type: String, required: true, trim: true },
  age: { type: Number, required: true, min: 0, max: 360 },
  breed: { type: String, required: true, trim: true },
  healthStatus: { type: String, default: 'Healthy', enum: ['Healthy', 'Minor Care Required', 'Special Needs'] },
  vaccinated: { type: Boolean, default: false },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
    address: { type: String, required: true }
  },
  description: { type: String, required: true, trim: true, minlength: 10 },
  media: [{
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], default: 'image' }
  }],
  listedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adopted: { type: Boolean, default: false },
  adoptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  temperament: [{ type: String, trim: true }],
  trainingStatus: { type: String, enum: ['None', 'Basic', 'Advanced'], default: 'None' },
  specialNeedsDescription: { type: String, trim: true },
  adoptionUrgency: { type: String, enum: ['Normal', 'High', 'Critical'], default: 'Normal' },
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  size: { type: String, enum: ['Small', 'Medium', 'Large', 'Extra Large'], required: true }
}, { timestamps: true });

// Geospatial index for location-based search
DogSchema.index({ location: '2dsphere' });

export const Dog = mongoose.model<IDog>('Dog', DogSchema);
