import { v4 as uuidv4 } from 'uuid';
import type { Invite } from './invite.models';
import { getPodById } from '../pod/pod.services';

const invites: Map<string, Invite> = new Map();

const BASE_URL = process.env.BASE_URL ?? 'https://partywings.app';

export function generateShortLink(podId: string): string {
  const code = uuidv4().slice(0, 8);
  return `${BASE_URL}/p/${code}?pod=${podId}`;
}

export interface InviteContact {
  phone: string;
  name: string;
}

export interface SmsMessage {
  phone: string;
  body: string;
}

export function createInvites(
  podId: string,
  inviterId: string,
  contacts: InviteContact[],
): { invites: Invite[]; smsMessages: SmsMessage[] } {
  const pod = getPodById(podId);
  const podTitle = pod?.title ?? 'a Pod';

  const created: Invite[] = [];
  const smsMessages: SmsMessage[] = [];

  for (const contact of contacts) {
    const shortLink = generateShortLink(podId);
    const invite: Invite = {
      id: uuidv4(),
      podId,
      inviterId,
      inviteePhone: contact.phone,
      inviteeName: contact.name,
      status: 'PENDING',
      shortLink,
      createdAt: new Date().toISOString(),
    };
    invites.set(invite.id, invite);
    created.push(invite);

    smsMessages.push({
      phone: contact.phone,
      body: `Hey ${contact.name}! You're invited to "${podTitle}" on PartyWings. Join here: ${shortLink}`,
    });
  }

  return { invites: created, smsMessages };
}

export function getInvitesForPod(podId: string): Invite[] {
  return Array.from(invites.values()).filter((i) => i.podId === podId);
}
