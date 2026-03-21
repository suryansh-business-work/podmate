import resolvers from '../emailTemplate.resolvers';
import * as service from '../emailTemplate.services';
import type { GraphQLContext } from '../../auth/auth.models';
import { UserRole } from '../../user/user.models';

jest.mock('../emailTemplate.services');

const adminContext: GraphQLContext = {
  user: { userId: 'admin-1', phone: '+911234567890', roles: [UserRole.ADMIN] },
};

const userContext: GraphQLContext = {
  user: { userId: 'user-1', phone: '+911234567890', roles: [UserRole.USER] },
};

const unauthContext: GraphQLContext = { user: null };

describe('emailTemplate.resolvers - seedDefaultTemplates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('seeds templates for admin', async () => {
    const mockResult = {
      created: ['email-otp', 'profile-update'],
      skipped: ['email-verified'],
      errors: [],
    };
    (service.seedDefaultTemplates as jest.Mock).mockResolvedValue(mockResult);

    const result = await resolvers.Mutation.seedDefaultTemplates(
      undefined,
      {},
      adminContext,
    );

    expect(result).toEqual(mockResult);
    expect(service.seedDefaultTemplates).toHaveBeenCalledTimes(1);
  });

  it('throws for non-admin user', async () => {
    await expect(
      resolvers.Mutation.seedDefaultTemplates(undefined, {}, userContext),
    ).rejects.toThrow();
  });

  it('throws for unauthenticated user', async () => {
    await expect(
      resolvers.Mutation.seedDefaultTemplates(undefined, {}, unauthContext),
    ).rejects.toThrow();
  });

  it('propagates service errors', async () => {
    (service.seedDefaultTemplates as jest.Mock).mockRejectedValue(
      new Error('Database error'),
    );

    await expect(
      resolvers.Mutation.seedDefaultTemplates(undefined, {}, adminContext),
    ).rejects.toThrow('Database error');
  });
});
