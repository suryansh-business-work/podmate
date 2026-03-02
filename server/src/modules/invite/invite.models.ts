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
