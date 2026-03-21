import mongoose, { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface TemplateVariable {
  key: string;
  description: string;
  defaultValue: string;
  required: boolean;
}

export interface EmailTemplate {
  id: string;
  slug: string;
  name: string;
  subject: string;
  mjmlBody: string;
  variables: TemplateVariable[];
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type EmailTemplateMongoDoc = Omit<EmailTemplate, 'id'> & { _id: string };

const TemplateVariableSchema = new Schema<TemplateVariable>(
  {
    key: { type: String, required: true },
    description: { type: String, default: '' },
    defaultValue: { type: String, default: '' },
    required: { type: Boolean, default: false },
  },
  { _id: false },
);

const EmailTemplateSchema = new Schema<EmailTemplateMongoDoc>(
  {
    _id: { type: String, default: () => uuidv4() },
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    subject: { type: String, required: true },
    mjmlBody: { type: String, required: true },
    variables: { type: [TemplateVariableSchema], default: [] },
    category: { type: String, default: 'general' },
    isActive: { type: Boolean, default: true },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

export const EmailTemplateModel =
  (mongoose.models['EmailTemplate'] as mongoose.Model<EmailTemplateMongoDoc> | undefined) ??
  model<EmailTemplateMongoDoc>('EmailTemplate', EmailTemplateSchema);

export function toEmailTemplate(
  doc: (EmailTemplateMongoDoc & { id?: string }) | null,
): EmailTemplate | null {
  if (!doc) return null;
  return { ...doc, id: doc.id ?? doc._id } as EmailTemplate;
}
