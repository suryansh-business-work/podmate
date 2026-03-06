import { v4 as uuidv4 } from 'uuid';
import type { Policy, CreatePolicyInput, UpdatePolicyInput } from './policy.models';
import { PolicyModel, toPolicy } from './policy.models';
import { createNotification } from '../notification/notification.services';
import { UserModel } from '../user/user.models';
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
    version: 1,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });
  logger.info(`Policy created: ${doc.title} (${doc.type})`);
  return toPolicy(doc.toObject({ virtuals: true })) as Policy;
}

export async function updatePolicy(id: string, input: UpdatePolicyInput): Promise<Policy> {
  const existing = await PolicyModel.findById(id).lean({ virtuals: true });
  if (!existing) throw new Error('Policy not found');

  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (input.title !== undefined) update.title = input.title;
  if (input.content !== undefined) {
    update.content = input.content;
    update.version = (existing.version ?? 0) + 1;
  }
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
  logger.info(`Policy updated: ${result.title} (v${result.version})`);

  /* Notify users if requested */
  if (input.notifyUsers) {
    await notifyUsersAboutPolicyUpdate(result);
  }

  return result;
}

async function notifyUsersAboutPolicyUpdate(policy: Policy): Promise<void> {
  try {
    const users = await UserModel.find({ isActive: true }, { _id: 1 }).lean();
    const notifications = users.map((u) =>
      createNotification(
        (u as { _id: string })._id,
        'GENERAL',
        `Policy Updated: ${policy.title}`,
        `The ${policy.type.replace(/_/g, ' ').toLowerCase()} policy has been updated to version ${policy.version}. Please review the changes.`,
        JSON.stringify({ policyId: policy.id, policyType: policy.type }),
      ),
    );
    await Promise.all(notifications);
    logger.info(`Notified ${users.length} users about policy update: ${policy.title}`);
  } catch (err) {
    logger.error('Failed to notify users about policy update:', err);
  }
}

export async function deletePolicy(id: string): Promise<boolean> {
  const result = await PolicyModel.deleteOne({ _id: id });
  if (result.deletedCount > 0) logger.info(`Policy deleted: ${id}`);
  return result.deletedCount > 0;
}
