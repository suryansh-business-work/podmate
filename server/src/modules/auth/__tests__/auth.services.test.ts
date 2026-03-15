import jwt from 'jsonwebtoken';
import {
  signToken,
  verifyToken,
  getUserFromRequest,
  requireAuth,
  requireRole,
} from '../auth.services';
import { UserRole } from '../../user/user.models';
import type { GraphQLContext, AuthPayload } from '../auth.models';

const JWT_SECRET = process.env.JWT_SECRET ?? 'partywings-dev-secret';

describe('Auth Services - Token Management', () => {
  const mockPayload: AuthPayload = {
    userId: 'test-user-123',
    phone: '+919876543210',
    roles: [UserRole.USER],
  };

  it('should sign a valid JWT token', () => {
    const token = signToken(mockPayload);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('should verify a valid token and return payload', () => {
    const token = signToken(mockPayload);
    const result = verifyToken(token);
    expect(result).toBeDefined();
    expect(result?.userId).toBe(mockPayload.userId);
    expect(result?.phone).toBe(mockPayload.phone);
    expect(result?.roles).toEqual(mockPayload.roles);
  });

  it('should return null for an invalid token', () => {
    const result = verifyToken('invalid.token.here');
    expect(result).toBeNull();
  });

  it('should return null for an empty token', () => {
    const result = verifyToken('');
    expect(result).toBeNull();
  });

  it('should return null for an expired token', () => {
    const expiredToken = jwt.sign(mockPayload, JWT_SECRET, { expiresIn: '0s' });
    const result = verifyToken(expiredToken);
    expect(result).toBeNull();
  });

  it('should include standard JWT claims (iat, exp)', () => {
    const token = signToken(mockPayload);
    const decoded = jwt.decode(token) as Record<string, unknown>;
    expect(decoded.iat).toBeDefined();
    expect(decoded.exp).toBeDefined();
  });
});

describe('Auth Services - Request Extraction', () => {
  it('should extract user from valid authorization header', () => {
    const payload: AuthPayload = {
      userId: 'user-1',
      phone: '+911234567890',
      roles: [UserRole.USER],
    };
    const token = signToken(payload);
    const req = { headers: { authorization: `Bearer ${token}` } };

    const result = getUserFromRequest(req);
    expect(result?.userId).toBe('user-1');
    expect(result?.phone).toBe('+911234567890');
  });

  it('should return null when no authorization header exists', () => {
    const req = { headers: {} };
    const result = getUserFromRequest(req);
    expect(result).toBeNull();
  });

  it('should return null for invalid Bearer token', () => {
    const req = { headers: { authorization: 'Bearer invalid-token' } };
    const result = getUserFromRequest(req);
    expect(result).toBeNull();
  });
});

describe('Auth Services - Authorization', () => {
  it('should return user payload when authenticated', () => {
    const user: AuthPayload = {
      userId: 'user-1',
      phone: '+911234567890',
      roles: [UserRole.USER],
    };
    const context: GraphQLContext = { user };

    const result = requireAuth(context);
    expect(result.userId).toBe('user-1');
  });

  it('should throw when user is not authenticated', () => {
    const context: GraphQLContext = { user: null };
    expect(() => requireAuth(context)).toThrow('Authentication required');
  });

  it('should pass role check when user has required role', () => {
    const user: AuthPayload = {
      userId: 'admin-1',
      phone: '+911234567890',
      roles: [UserRole.ADMIN],
    };
    const context: GraphQLContext = { user };

    const result = requireRole(context, UserRole.ADMIN);
    expect(result.roles).toContain(UserRole.ADMIN);
  });

  it('should throw when user does not have required role', () => {
    const user: AuthPayload = {
      userId: 'user-1',
      phone: '+911234567890',
      roles: [UserRole.USER],
    };
    const context: GraphQLContext = { user };

    expect(() => requireRole(context, UserRole.ADMIN)).toThrow('Access denied');
  });

  it('should accept any of multiple allowed roles', () => {
    const user: AuthPayload = {
      userId: 'owner-1',
      phone: '+911234567890',
      roles: [UserRole.VENUE_OWNER],
    };
    const context: GraphQLContext = { user };

    const result = requireRole(context, UserRole.ADMIN, UserRole.VENUE_OWNER);
    expect(result.roles).toContain(UserRole.VENUE_OWNER);
  });

  it('should throw for unauthenticated user on role check', () => {
    const context: GraphQLContext = { user: null };
    expect(() => requireRole(context, UserRole.USER)).toThrow('Authentication required');
  });
});
