import { v4 as uuidv4 } from 'uuid';
import { LiveSessionModel, toLiveSession } from './goLive.models';
import type { LiveSession, PaginatedLiveSessions, StartLiveInput } from './goLive.models';
import logger from '../../lib/logger';

export async function startLiveSession(
  hostId: string,
  input: StartLiveInput,
): Promise<LiveSession> {
  // Check if user already has an active session
  const existing = await LiveSessionModel.findOne({ hostId, status: 'LIVE' }).lean();
  if (existing) {
    throw new Error('You already have an active live session');
  }

  const doc = await LiveSessionModel.create({
    _id: uuidv4(),
    hostId,
    podId: input.podId,
    title: input.title,
    description: input.description ?? '',
    status: 'LIVE',
    startedAt: new Date().toISOString(),
  });

  logger.info(`Live session started by user ${hostId} for pod ${input.podId}`);
  return toLiveSession(doc.toObject({ virtuals: true }));
}

export async function endLiveSession(sessionId: string, hostId: string): Promise<LiveSession> {
  const doc = await LiveSessionModel.findOneAndUpdate(
    { _id: sessionId, hostId, status: 'LIVE' },
    { $set: { status: 'ENDED', endedAt: new Date().toISOString() } },
    { returnDocument: 'after' },
  );
  if (!doc) throw new Error('Live session not found or already ended');
  logger.info(`Live session ${sessionId} ended by host ${hostId}`);
  return toLiveSession(doc.toObject({ virtuals: true }));
}

export async function joinLiveSession(sessionId: string, userId: string): Promise<LiveSession> {
  const session = await LiveSessionModel.findById(sessionId);
  if (!session) throw new Error('Live session not found');
  if (session.status !== 'LIVE') throw new Error('Session has ended');

  if (!session.viewerIds.includes(userId)) {
    session.viewerIds.push(userId);
    session.viewerCount = session.viewerIds.length;
    await session.save();
  }

  return toLiveSession(session.toObject({ virtuals: true }));
}

export async function leaveLiveSession(sessionId: string, userId: string): Promise<LiveSession> {
  const session = await LiveSessionModel.findById(sessionId);
  if (!session) throw new Error('Live session not found');

  session.viewerIds = session.viewerIds.filter((id) => id !== userId);
  session.viewerCount = session.viewerIds.length;
  await session.save();

  return toLiveSession(session.toObject({ virtuals: true }));
}

export async function getActiveSessions(
  page: number,
  limit: number,
): Promise<PaginatedLiveSessions> {
  const filter = { status: 'LIVE' };
  const total = await LiveSessionModel.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const docs = await LiveSessionModel.find(filter)
    .sort({ startedAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean({ virtuals: true });

  return {
    items: docs.map((d) => toLiveSession(d as never)),
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getLiveSessionForPod(podId: string): Promise<LiveSession | null> {
  const doc = await LiveSessionModel.findOne({ podId, status: 'LIVE' }).lean({ virtuals: true });
  if (!doc) return null;
  return toLiveSession(doc as never);
}
