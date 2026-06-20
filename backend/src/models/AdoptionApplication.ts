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

export enum InterviewStatus {
  NOT_SCHEDULED = 'not_scheduled',
  PROPOSED = 'proposed',
  CONFIRMED = 'confirmed',
  RESCHEDULED = 'rescheduled',
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
  // Adopter contact for direct communication (WhatsApp/phone)
  adopterPhone?: string;
  adopterWhatsApp?: string;
  adopterCity?: string;
  
  // Interview scheduling
  interviewDate?: Date;
  interviewStatus?: InterviewStatus;
  interviewNotes?: string;
  interviewProposedBy?: mongoose.Types.ObjectId;
  
  // Workflow tracking
  homeVisitDate?: Date;
  rejectionReason?: string;
  rescheduleCount: number;
  
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
  adopterPhone: { type: String, trim: true },
  adopterWhatsApp: { type: String, trim: true },
  adopterCity: { type: String, trim: true },
  
  // Interview scheduling
  interviewDate: { type: Date },
  interviewStatus: { type: String, enum: Object.values(InterviewStatus), default: InterviewStatus.NOT_SCHEDULED },
  interviewNotes: { type: String },
  interviewProposedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  homeVisitDate: { type: Date },
  rejectionReason: { type: String },
  rescheduleCount: { type: Number, default: 0 },
}, { timestamps: true });

// Prevent duplicate active applications for the same dog by the same adopter
AdoptionApplicationSchema.index({ dogId: 1, adopterId: 1 }, { unique: true });

export const AdoptionApplication = mongoose.model<IAdoptionApplication>('AdoptionApplication', AdoptionApplicationSchema);
