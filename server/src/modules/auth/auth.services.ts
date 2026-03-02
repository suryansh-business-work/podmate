import jwt from 'jsonwebtoken';
import type { AuthPayload } from './auth.models';
import type { User } from '../user/user.models';
import { UserRole } from '../user/user.models';
import type { GraphQLContext } from './auth.models';
import * as userService from '../user/user.services';
import { sendSMS, sendAdminCredentials } from '../../lib/email';
import logger from '../../lib/logger';

const JWT_SECRET = process.env.JWT_SECRET ?? 'partywings-dev-secret';
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

interface OtpRecord {
  otp: string;
  expiresAt: number;
}

const otpStore = new Map<string, OtpRecord>();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

export async function sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
  const otp = generateOtp();
  otpStore.set(phone, { otp, expiresAt: Date.now() + OTP_EXPIRY_MS });

  const otpMessage = `Your PartyWings OTP is: ${otp}. Valid for 5 minutes.`;
  await sendSMS(phone, otpMessage);
  logger.info(`OTP sent to ${phone}`);
  return { success: true, message: `OTP sent to ${phone}` };
}

export async function verifyOtp(
  phone: string,
  otp: string,
): Promise<{ token: string; user: User; isNewUser: boolean }> {
  const record = otpStore.get(phone);

  if (!record) {
    throw new Error('OTP not found or expired. Please request a new one.');
  }
  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    throw new Error('OTP has expired. Please request a new one.');
  }
  if (otp !== record.otp) {
    throw new Error('Invalid OTP. Please try again.');
  }

  otpStore.delete(phone); // single-use

  let user = await userService.findUserByPhone(phone);
  let isNewUser = false;

  if (!user) {
    user = await userService.createUser({ phone });
    isNewUser = true;
  }

  logger.info(`User ${user.id} verified via OTP (isNew: ${isNewUser})`);
  const token = signToken({ userId: user.id, phone: user.phone, role: user.role });
  return { token, user, isNewUser };
}

export async function adminLogin(
  email: string,
  password: string,
): Promise<{ token: string; user: User }> {
  const user = await userService.findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }
  if (user.password !== password) {
    throw new Error('Invalid email or password');
  }
  if (user.role !== UserRole.ADMIN) {
    throw new Error('Access denied. Admin privileges required.');
  }

  logger.info(`Admin login: ${email}`);
  const token = signToken({ userId: user.id, phone: user.phone, role: user.role });
  return { token, user };
}

export async function sendAdminCredentialsEmail(
  email: string,
): Promise<{ success: boolean; message: string }> {
  const user = await userService.findUserByEmail(email);
  if (!user) {
    throw new Error('Admin user not found');
  }
  await sendAdminCredentials(email, user.password);
  logger.info(`Admin credentials sent to ${email}`);
  return { success: true, message: `Credentials sent to ${email}` };
}

export async function completeProfile(
  userId: string,
  username: string,
  name: string,
  dob: string,
): Promise<User> {
  logger.info(`Profile completed for user ${userId}`);
  return userService.completeUserProfile(userId, username, name, dob);
}
