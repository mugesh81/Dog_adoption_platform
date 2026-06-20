import mongoose, { Document, Schema } from 'mongoose';

export enum NotificationType {
  APPLICATION_STATUS_CHANGE = 'application_status_change',
  NEW_APPLICATION = 'new_application',
  INTERVIEW_PROPOSED = 'interview_proposed',
  INTERVIEW_CONFIRMED = 'interview_confirmed',
  INTERVIEW_RESCHEDULED = 'interview_rescheduled',
}

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  relatedApplication?: mongoose.Types.ObjectId;
  relatedDog?: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: Object.values(NotificationType), required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedApplication: { type: mongoose.Schema.Types.ObjectId, ref: 'AdoptionApplication' },
  relatedDog: { type: mongoose.Schema.Types.ObjectId, ref: 'Dog' },
  read: { type: Boolean, default: false },
}, { timestamps: true });

// Index for efficient queries
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
