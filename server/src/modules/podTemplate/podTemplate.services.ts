import { v4 as uuidv4 } from 'uuid';
import type {
  PodTemplate,
  CreatePodTemplateInput,
  UpdatePodTemplateInput,
  PaginatedPodTemplates,
} from './podTemplate.models';
import { PodTemplateModel, toPodTemplate } from './podTemplate.models';

export async function getPodTemplates(
  page: number,
  limit: number,
  search?: string,
): Promise<PaginatedPodTemplates> {
  const filter: Record<string, unknown> = {};
  if (search) {
    filter['name'] = { $regex: search, $options: 'i' };
  }
  const total = await PodTemplateModel.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const docs = await PodTemplateModel.find(filter)
    .sort({ sortOrder: 1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean({ virtuals: true });

  return {
    items: docs.map(toPodTemplate).filter(Boolean) as PodTemplate[],
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getActivePodTemplates(): Promise<PodTemplate[]> {
  const docs = await PodTemplateModel.find({ isActive: true })
    .sort({ sortOrder: 1 })
    .lean({ virtuals: true });
  return docs.map(toPodTemplate).filter(Boolean) as PodTemplate[];
}

export async function createPodTemplate(input: CreatePodTemplateInput): Promise<PodTemplate> {
  const doc = await PodTemplateModel.create({
    _id: uuidv4(),
    ...input,
    isActive: true,
    createdAt: new Date().toISOString(),
  });
  return toPodTemplate(doc.toObject({ virtuals: true })) as PodTemplate;
}

export async function updatePodTemplate(
  id: string,
  input: UpdatePodTemplateInput,
): Promise<PodTemplate | null> {
  const doc = await PodTemplateModel.findByIdAndUpdate(id, { $set: input }, { returnDocument: 'after' })
    .lean({ virtuals: true });
  return toPodTemplate(doc);
}

export async function deletePodTemplate(id: string): Promise<boolean> {
  const result = await PodTemplateModel.findByIdAndDelete(id);
  return !!result;
}
