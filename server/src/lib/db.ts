import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import logger from './logger';
import { UserModel } from '../modules/user/user.models';
import { PolicyModel } from '../modules/policy/policy.models';

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI environment variable is not set');

  await mongoose.connect(uri);
  logger.info('MongoDB connected');

  await seedDB();
}

async function seedDB(): Promise<void> {
  await seedAdminUser();
  await seedDefaultPolicies();
}

async function seedAdminUser(): Promise<void> {
  const adminEmail = process.env.DEV_EMAIL ?? 'admin@partywings.com';
  const existing = await UserModel.findOne({ role: 'ADMIN' });
  if (existing) return;

  const now = new Date().toISOString();
  await UserModel.create({
    _id: uuidv4(),
    phone: 'admin',
    email: adminEmail,
    password: 'Admin@2026',
    name: 'Admin',
    age: 0,
    avatar: '',
    role: 'ADMIN',
    isVerifiedHost: true,
    createdAt: now,
  });
  logger.info(`Admin user seeded: ${adminEmail} / Admin@2026`);
}

async function seedDefaultPolicies(): Promise<void> {
  const count = await PolicyModel.countDocuments();
  if (count > 0) return;

  const now = new Date().toISOString();
  await PolicyModel.insertMany([
    {
      _id: uuidv4(),
      type: 'VENUE',
      title: 'Venue Policy',
      content:
        'Venues must maintain safe, clean, and welcoming environments for all pod participants at all times.',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: uuidv4(),
      type: 'USER',
      title: 'User Policy',
      content:
        'Users must respect all venue rules, other participants, and follow the community guidelines established by PartyWings.',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
    {
      _id: uuidv4(),
      type: 'HOST',
      title: 'Host Policy',
      content:
        'Hosts are responsible for the safety, enjoyment, and smooth execution of all pod events they organize.',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    },
  ]);
  logger.info('Default policies seeded (VENUE, USER, HOST)');
}
