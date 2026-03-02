const inviteTypeDefs = `#graphql
  type Invite {
    id: ID!
    podId: ID!
    inviterId: ID!
    inviteePhone: String!
    inviteeName: String!
    status: InviteStatus!
    shortLink: String!
    createdAt: String!
  }

  enum InviteStatus {
    PENDING
    ACCEPTED
    DECLINED
  }

  input InviteInput {
    phone: String!
    name: String!
  }

  type InviteResult {
    success: Boolean!
    totalInvited: Int!
    invites: [Invite!]!
    smsMessages: [SmsMessage!]!
  }

  type SmsMessage {
    phone: String!
    body: String!
  }
`;

export default inviteTypeDefs;
