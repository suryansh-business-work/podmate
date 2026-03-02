import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface Invite {
  id: string;
  podId: string;
  inviterId: string;
  inviteePhone: string;
  inviteeName: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  shortLink: string;
  createdAt: string;
}

/* ── Mongoose ── */

export type InviteMongoDoc = Omit<Invite, 'id'> & { _id: string };

const InviteSchema = new Schema<InviteMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    podId: { type: String, required: true, index: true },
    inviterId: { type: String, required: true },
    inviteePhone: { type: String, required: true },
    inviteeName: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'ACCEPTED', 'DECLINED'], default: 'PENDING' },
    shortLink: { type: String, required: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export const InviteModel =
  (mongoose.models['Invite'] as mongoose.Model<InviteMongoDoc> | undefined) ??
  model<InviteMongoDoc>('Invite', InviteSchema);

export function toInvite(doc: (InviteMongoDoc & { id?: string }) | null): Invite | null {
  if (!doc) return null;
  return { ...doc, id: doc.id ?? doc._id } as Invite;
}
