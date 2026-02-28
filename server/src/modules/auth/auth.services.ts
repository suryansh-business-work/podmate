import jwt from 'jsonwebtoken';
import type { AuthPayload } from './auth.models';
import { UserRole } from '../user/user.models';
import type { GraphQLContext } from './auth.models';
import * as userService from '../user/user.services';

const JWT_SECRET = process.env.JWT_SECRET ?? 'partywings-dev-secret';
const OTP_DEFAULT = process.env.OTP_DEFAULT ?? '123456';

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export function getUserFromRequest(req: {
  headers: { authorization?: string };
}): AuthPayload | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  return verifyToken(token);
}

export function requireAuth(context: GraphQLContext): AuthPayload {
  if (!context.user) throw new Error('Authentication required');
  return context.user;
}

export function requireRole(context: GraphQLContext, ...roles: UserRole[]): AuthPayload {
  const user = requireAuth(context);
  if (!roles.includes(user.role)) {
    throw new Error(`Access denied. Required roles: ${roles.join(', ')}`);
  }
  return user;
}

export function sendOtp(phone: string): { success: boolean; message: string } {
  return { success: true, message: `OTP sent to ${phone}` };
}

export function verifyOtp(
  phone: string,
  otp: string,
): { token: string; user: ReturnType<typeof userService.findUserById>; isNewUser: boolean } {
  if (otp !== OTP_DEFAULT) {
    throw new Error('Invalid OTP. Please try again.');
  }

  let user = userService.findUserByPhone(phone);
  let isNewUser = false;

  if (!user) {
    user = userService.createUser({ phone });
    isNewUser = true;
  }

  const token = signToken({ userId: user.id, phone: user.phone, role: user.role });
  return { token, user, isNewUser };
}
