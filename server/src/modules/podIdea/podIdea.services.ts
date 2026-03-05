import { v4 as uuidv4 } from 'uuid';
import { PodIdeaModel, toPodIdea } from './podIdea.models';
import type { PodIdea, PaginatedPodIdeas, CreatePodIdeaInput, PodIdeaStatus } from './podIdea.models';
import logger from '../../lib/logger';

export async function createPodIdea(userId: string, input: CreatePodIdeaInput): Promise<PodIdea> {
  const now = new Date().toISOString();
  const doc = await PodIdeaModel.create({
    _id: uuidv4(),
    userId,
    title: input.title,
    description: input.description,
    category: input.category,
    location: input.location ?? '',
    estimatedBudget: input.estimatedBudget ?? '',
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  });

  logger.info(`Pod idea submitted by user ${userId}: ${input.title}`);
  return toPodIdea(doc.toObject({ virtuals: true }));
}

export async function getPodIdeas(
  page: number,
  limit: number,
  category?: string,
): Promise<PaginatedPodIdeas> {
  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;

  const total = await PodIdeaModel.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const docs = await PodIdeaModel.find(filter)
    .sort({ upvoteCount: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean({ virtuals: true });

  return {
    items: docs.map((d) => toPodIdea(d as never)),
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getMyPodIdeas(userId: string): Promise<PodIdea[]> {
  const docs = await PodIdeaModel.find({ userId })
    .sort({ createdAt: -1 })
    .lean({ virtuals: true });
  return docs.map((d) => toPodIdea(d as never));
}

export async function upvotePodIdea(userId: string, ideaId: string): Promise<PodIdea> {
  const idea = await PodIdeaModel.findById(ideaId);
  if (!idea) throw new Error('Pod idea not found');

  if (idea.upvoterIds.includes(userId)) {
    throw new Error('Already upvoted this idea');
  }

  idea.upvoterIds.push(userId);
  idea.upvoteCount = idea.upvoterIds.length;
  idea.updatedAt = new Date().toISOString();
  await idea.save();

  return toPodIdea(idea.toObject({ virtuals: true }));
}

export async function removeUpvote(userId: string, ideaId: string): Promise<PodIdea> {
  const idea = await PodIdeaModel.findById(ideaId);
  if (!idea) throw new Error('Pod idea not found');

  idea.upvoterIds = idea.upvoterIds.filter((id) => id !== userId);
  idea.upvoteCount = idea.upvoterIds.length;
  idea.updatedAt = new Date().toISOString();
  await idea.save();

  return toPodIdea(idea.toObject({ virtuals: true }));
}

export async function updatePodIdea(
  id: string,
  status?: PodIdeaStatus,
  adminNotes?: string,
): Promise<PodIdea> {
  const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (status) update.status = status;
  if (adminNotes !== undefined) update.adminNotes = adminNotes;

  const doc = await PodIdeaModel.findByIdAndUpdate(
    id,
    { $set: update },
    { returnDocument: 'after' },
  );
  if (!doc) throw new Error('Pod idea not found');
  return toPodIdea(doc.toObject({ virtuals: true }));
}

export async function deletePodIdea(id: string): Promise<boolean> {
  const result = await PodIdeaModel.deleteOne({ _id: id });
  return result.deletedCount > 0;
}
