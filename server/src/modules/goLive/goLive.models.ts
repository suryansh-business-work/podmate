import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type LiveSessionStatus = 'LIVE' | 'ENDED';

export interface LiveSession {
  id: string;
  hostId: string;
  podId: string;
  title: string;
  description: string;
  status: LiveSessionStatus;
  viewerIds: string[];
  viewerCount: number;
  startedAt: string;
  endedAt: string;
}

export interface PaginatedLiveSessions {
  items: LiveSession[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StartLiveInput {
  podId: string;
  title: string;
  description?: string;
}

/* ── Mongoose ── */

export type LiveSessionMongoDoc = Omit<LiveSession, 'id'> & { _id: string };

const LiveSessionSchema = new Schema<LiveSessionMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    hostId: { type: String, required: true, index: true },
    podId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['LIVE', 'ENDED'], default: 'LIVE' },
    viewerIds: { type: [String], default: [] },
    viewerCount: { type: Number, default: 0 },
    startedAt: { type: String, default: () => new Date().toISOString() },
    endedAt: { type: String, default: '' },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export const LiveSessionModel =
  (mongoose.models['LiveSession'] as mongoose.Model<LiveSessionMongoDoc> | undefined) ??
  model<LiveSessionMongoDoc>('LiveSession', LiveSessionSchema);

export function toLiveSession(doc: LiveSessionMongoDoc & { id?: string }): LiveSession {
  return {
    id: doc.id ?? doc._id,
    hostId: doc.hostId,
    podId: doc.podId,
    title: doc.title,
    description: doc.description ?? '',
    status: doc.status,
    viewerIds: doc.viewerIds ?? [],
    viewerCount: doc.viewerCount ?? 0,
    startedAt: doc.startedAt,
    endedAt: doc.endedAt ?? '',
  };
}
