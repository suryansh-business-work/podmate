import { v4 as uuidv4 } from 'uuid';
import type { Invite } from './invite.models';
import { InviteModel, toInvite } from './invite.models';
import { getPodById } from '../pod/pod.services';

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

export async function createInvites(
  podId: string,
  inviterId: string,
  contacts: InviteContact[],
): Promise<{ invites: Invite[]; smsMessages: SmsMessage[] }> {
  const pod = await getPodById(podId);
  const podTitle = pod?.title ?? 'a Pod';

  const created: Invite[] = [];
  const smsMessages: SmsMessage[] = [];

  for (const contact of contacts) {
    const shortLink = generateShortLink(podId);
    const doc = await InviteModel.create({
      _id: uuidv4(),
      podId,
      inviterId,
      inviteePhone: contact.phone,
      inviteeName: contact.name,
      status: 'PENDING',
      shortLink,
      createdAt: new Date().toISOString(),
    });
    created.push(toInvite(doc.toObject({ virtuals: true })) as Invite);

    smsMessages.push({
      phone: contact.phone,
      body: `Hey ${contact.name}! You're invited to "${podTitle}" on PartyWings. Join here: ${shortLink}`,
    });
  }

  return { invites: created, smsMessages };
}

export async function getInvitesForPod(podId: string): Promise<Invite[]> {
  const docs = await InviteModel.find({ podId }).lean({ virtuals: true });
  return docs.map(toInvite).filter(Boolean) as Invite[];
}
