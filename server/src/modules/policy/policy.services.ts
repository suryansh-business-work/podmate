import { v4 as uuidv4 } from 'uuid';
import type { Policy, CreatePolicyInput, UpdatePolicyInput, PolicyType } from './policy.models';
import logger from '../../lib/logger';

const policies: Map<string, Policy> = new Map();

const seedPolicies: Policy[] = [
  {
    id: 'policy-1',
    type: 'VENUE',
    title: 'Venue Registration Policy',
    content:
      'All venue owners must provide valid business registration documents, proof of address, and comply with local safety regulations. PartyWings reserves the right to verify all documents and reject applications that do not meet our standards.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'policy-2',
    type: 'USER',
    title: 'User Terms of Service',
    content:
      'By using PartyWings, you agree to participate respectfully in all pods, maintain accurate profile information, and abide by our community guidelines. Violations may result in account suspension.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'policy-3',
    type: 'HOST',
    title: 'Host Responsibilities',
    content:
      'Hosts must ensure their events are safe, well-organized, and as described. A 5% platform fee applies to all transactions. Funds are held in escrow until the event is verified as completed.',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

seedPolicies.forEach((p) => policies.set(p.id, p));

export function getPolicies(type?: string): Policy[] {
  let items = [...policies.values()];
  if (type) {
    items = items.filter((p) => p.type === type);
  }
  return items.filter((p) => p.isActive);
}

export function getAllPolicies(type?: string): Policy[] {
  let items = [...policies.values()];
  if (type) {
    items = items.filter((p) => p.type === type);
  }
  return items;
}

export function createPolicy(input: CreatePolicyInput): Policy {
  const policy: Policy = {
    id: uuidv4(),
    type: input.type,
    title: input.title,
    content: input.content,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  policies.set(policy.id, policy);
  logger.info(`Policy created: ${policy.title} (${policy.type})`);
  return policy;
}

export function updatePolicy(id: string, input: UpdatePolicyInput): Policy {
  const policy = policies.get(id);
  if (!policy) throw new Error('Policy not found');
  if (input.title !== undefined) policy.title = input.title;
  if (input.content !== undefined) policy.content = input.content;
  if (input.isActive !== undefined) policy.isActive = input.isActive;
  policy.updatedAt = new Date().toISOString();
  policies.set(policy.id, policy);
  logger.info(`Policy updated: ${policy.title}`);
  return policy;
}

export function deletePolicy(id: string): boolean {
  const deleted = policies.delete(id);
  if (deleted) logger.info(`Policy deleted: ${id}`);
  return deleted;
}
