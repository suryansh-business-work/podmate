export interface Policy {
  id: string;
  type: PolicyType;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PolicyType = 'VENUE' | 'USER' | 'HOST';

export interface CreatePolicyInput {
  type: PolicyType;
  title: string;
  content: string;
}

export interface UpdatePolicyInput {
  title?: string;
  content?: string;
  isActive?: boolean;
}
