import { v4 as uuidv4 } from 'uuid';
import type { Policy, CreatePolicyInput, UpdatePolicyInput } from './policy.models';
import { PolicyModel, toPolicy } from './policy.models';
import logger from '../../lib/logger';

export async function getPolicies(type?: string): Promise<Policy[]> {
  const filter: Record<string, unknown> = { isActive: true };
  if (type) filter.type = type;
  const docs = await PolicyModel.find(filter).lean({ virtuals: true });
  return docs.map(toPolicy).filter(Boolean) as Policy[];
}

export async function getAllPolicies(type?: string): Promise<Policy[]> {
  const filter: Record<string, unknown> = {};
  if (type) filter.type = type;
  const docs = await PolicyModel.find(filter).lean({ virtuals: true });
  return docs.map(toPolicy).filter(Boolean) as Policy[];
}

export async function createPolicy(input: CreatePolicyInput): Promise<Policy> {
  const now = new Date().toISOString();
  const doc = await PolicyModel.create({
    _id: uuidv4(),
    type: input.type,
    title: input.title,
    content: input.content,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });
  logger.info(`Policy created: ${doc.title} (${doc.type})`);
  return toPolicy(doc.toObject({ virtuals: true })) as Policy;
}

export async function updatePolicy(id: string, input: UpdatePolicyInput): Promise<Policy> {
  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (input.title !== undefined) update.title = input.title;
  if (input.content !== undefined) update.content = input.content;
  if (input.isActive !== undefined) update.isActive = input.isActive;

  const updated = await PolicyModel.findByIdAndUpdate(
    id,
    { $set: update },
    { returnDocument: 'after' },
  ).lean({
    virtuals: true,
  });
  const result = toPolicy(updated);
  if (!result) throw new Error('Policy not found');
  logger.info(`Policy updated: ${result.title}`);
  return result;
}

export async function deletePolicy(id: string): Promise<boolean> {
  const result = await PolicyModel.deleteOne({ _id: id });
  if (result.deletedCount > 0) logger.info(`Policy deleted: ${id}`);
  return result.deletedCount > 0;
}
