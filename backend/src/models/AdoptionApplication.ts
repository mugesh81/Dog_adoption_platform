import mongoose, { Document, Schema } from 'mongoose';

export enum ApplicationStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  HOME_VISIT_SCHEDULED = 'home_visit_scheduled',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface IAdoptionApplication extends Document {
  dogId: mongoose.Types.ObjectId;
  adopterId: mongoose.Types.ObjectId;
  shelterOrDonorId: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  
  // Application details
  reasonForAdopting: string;
  hasOtherPets: boolean;
  otherPetsDescription?: string;
  familyMembersCount: number;
  agreeToHomeVisit: boolean;
  
  // Workflow tracking
  interviewDate?: Date;
  homeVisitDate?: Date;
  rejectionReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const AdoptionApplicationSchema: Schema = new Schema({
  dogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Dog', required: true },
  adopterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shelterOrDonorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: Object.values(ApplicationStatus), default: ApplicationStatus.PENDING },
  
  reasonForAdopting: { type: String, required: true },
  hasOtherPets: { type: Boolean, required: true },
  otherPetsDescription: { type: String },
  familyMembersCount: { type: Number, required: true, min: 1 },
  agreeToHomeVisit: { type: Boolean, required: true },
  
  interviewDate: { type: Date },
  homeVisitDate: { type: Date },
  rejectionReason: { type: String },
}, { timestamps: true });

// Prevent duplicate active applications for the same dog by the same adopter
AdoptionApplicationSchema.index({ dogId: 1, adopterId: 1 }, { unique: true });

export const AdoptionApplication = mongoose.model<IAdoptionApplication>('AdoptionApplication', AdoptionApplicationSchema);
