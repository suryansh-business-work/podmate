import { adminLogin, verifyToken } from '../auth.services';
import { UserRole } from '../../user/user.models';

jest.mock('../../user/user.services', () => ({
  findUserByEmail: jest.fn(),
}));

import * as userService from '../../user/user.services';

const mockFindUserByEmail = userService.findUserByEmail as jest.MockedFunction<
  typeof userService.findUserByEmail
>;

describe('Admin Login', () => {
  const adminUser = {
    id: 'admin-1',
    phone: '+919999999999',
    email: 'admin@test.com',
    password: 'admin-pass-123',
    username: 'admin',
    name: 'Admin User',
    age: 30,
    dob: '1994-01-01',
    avatar: '',
    roles: [UserRole.ADMIN],
    activeRole: UserRole.ADMIN,
    isVerifiedHost: false,
    isActive: true,
    disableReason: '',
    savedPodIds: [],
    themePreference: 'light',
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return token and user for valid admin credentials', async () => {
    mockFindUserByEmail.mockResolvedValue(adminUser);

    const result = await adminLogin('admin@test.com', 'admin-pass-123');

    expect(result.token).toBeDefined();
    expect(result.token.split('.')).toHaveLength(3);
    expect(result.user.id).toBe('admin-1');
    expect(result.user.roles).toContain(UserRole.ADMIN);
  });

  it('should return a valid JWT that can be verified', async () => {
    mockFindUserByEmail.mockResolvedValue(adminUser);

    const result = await adminLogin('admin@test.com', 'admin-pass-123');
    const decoded = verifyToken(result.token);

    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe('admin-1');
    expect(decoded?.roles).toContain(UserRole.ADMIN);
  });

  it('should throw for non-existent email', async () => {
    mockFindUserByEmail.mockResolvedValue(null);

    await expect(adminLogin('unknown@test.com', 'password')).rejects.toThrow(
      'Invalid email or password',
    );
  });

  it('should throw for incorrect password', async () => {
    mockFindUserByEmail.mockResolvedValue(adminUser);

    await expect(adminLogin('admin@test.com', 'wrong-password')).rejects.toThrow(
      'Invalid email or password',
    );
  });

  it('should throw for non-admin user', async () => {
    const normalUser = { ...adminUser, roles: [UserRole.USER], activeRole: UserRole.USER };
    mockFindUserByEmail.mockResolvedValue(normalUser);

    await expect(adminLogin('admin@test.com', 'admin-pass-123')).rejects.toThrow(
      'Access denied. Admin privileges required.',
    );
  });

  it('should throw for venue owner role', async () => {
    const venueOwner = {
      ...adminUser,
      roles: [UserRole.VENUE_OWNER],
      activeRole: UserRole.VENUE_OWNER,
    };
    mockFindUserByEmail.mockResolvedValue(venueOwner);

    await expect(adminLogin('admin@test.com', 'admin-pass-123')).rejects.toThrow(
      'Access denied. Admin privileges required.',
    );
  });

  it('should call findUserByEmail with provided email', async () => {
    mockFindUserByEmail.mockResolvedValue(adminUser);

    await adminLogin('admin@test.com', 'admin-pass-123');

    expect(mockFindUserByEmail).toHaveBeenCalledWith('admin@test.com');
    expect(mockFindUserByEmail).toHaveBeenCalledTimes(1);
  });
});
