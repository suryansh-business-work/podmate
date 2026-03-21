import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type MeetingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export type MeetingPurpose = 'POD_OWNER' | 'VENUE_OWNER' | 'GENERAL';

export interface Meeting {
  id: string;
  userId: string;
  userEmail: string;
  meetingDate: string;
  meetingTime: string;
  meetingLink: string;
  status: MeetingStatus;
  purpose: MeetingPurpose;
  adminNote: string;
  cancelReason: string;
  completedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeetingInput {
  email: string;
  meetingDate: string;
  meetingTime: string;
  updateProfileEmail: boolean;
  purpose: MeetingPurpose;
}

export interface UpdateMeetingInput {
  status?: MeetingStatus;
  adminNote?: string;
  meetingLink?: string;
  cancelReason?: string;
}

export type MeetingMongoDoc = Omit<Meeting, 'id'> & { _id: string };

const MeetingSchema = new Schema<MeetingMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, required: true },
    meetingDate: { type: String, required: true },
    meetingTime: { type: String, required: true },
    meetingLink: { type: String, default: '' },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
    },
    purpose: {
      type: String,
      enum: ['POD_OWNER', 'VENUE_OWNER', 'GENERAL'],
      default: 'GENERAL',
    },
    adminNote: { type: String, default: '' },
    cancelReason: { type: String, default: '' },
    completedAt: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

MeetingSchema.index({ meetingDate: 1, meetingTime: 1 });

export const MeetingModel =
  (mongoose.models['Meeting'] as mongoose.Model<MeetingMongoDoc> | undefined) ??
  model<MeetingMongoDoc>('Meeting', MeetingSchema);

export function toMeeting(doc: (MeetingMongoDoc & { id?: string }) | null): Meeting | null {
  if (!doc) return null;
  return { ...doc, id: doc.id ?? doc._id } as Meeting;
}
