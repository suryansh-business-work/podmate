import { v4 as uuidv4 } from 'uuid';
import type { Pod, CreatePodInput, UpdatePodInput, PodPaginationInput, PaginatedPods } from './pod.models';
import { findUserById } from '../user/user.services';

const pods: Map<string, Pod> = new Map();

const seedPods: Pod[] = [
  {
    id: 'pod-1',
    title: 'Omakase & Sake Night',
    description:
      'Join us for an intimate evening learning the art of Nigiri. Chef Kenji will guide us through fish selection, rice preparation, and knife skills.\n\nThe session includes all ingredients, sake tasting, and a 12-piece omakase dinner.',
    category: 'Social',
    imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
    hostId: 'user-1',
    feePerPerson: 1200,
    maxSeats: 10,
    currentSeats: 8,
    dateTime: '2026-08-12T19:00:00.000Z',
    location: 'Downtown Kitchen',
    locationDetail: 'SoHo, NY',
    rating: 4.9,
    reviewCount: 124,
    status: 'PENDING',
    refundPolicy: '24h Refund',
    attendeeIds: ['user-2', 'user-3'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pod-2',
    title: 'Startup Networking Hike',
    description: 'A beautiful sunrise hike combined with startup networking.',
    category: 'Outdoor',
    imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
    hostId: 'user-2',
    feePerPerson: 500,
    maxSeats: 20,
    currentSeats: 15,
    dateTime: '2026-08-13T06:00:00.000Z',
    location: 'Trailhead Park',
    locationDetail: 'Manali, HP',
    rating: 5.0,
    reviewCount: 42,
    status: 'CONFIRMED',
    refundPolicy: '48h Refund',
    attendeeIds: ['user-1', 'user-3', 'user-4'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pod-3',
    title: 'Premium Wine Tasting Evening',
    description: 'Explore curated wines from top vineyards.',
    category: 'Social',
    imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800',
    hostId: 'user-3',
    feePerPerson: 2500,
    maxSeats: 12,
    currentSeats: 0,
    dateTime: '2026-08-18T18:30:00.000Z',
    location: 'The Cellar',
    locationDetail: 'Bandra, Mumbai',
    rating: 0,
    reviewCount: 0,
    status: 'NEW',
    refundPolicy: '24h Refund',
    attendeeIds: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'pod-4',
    title: 'Tokyo-Style Sushi Masterclass',
    description: 'An intimate evening learning the art of Nigiri.',
    category: 'Learning',
    imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800',
    hostId: 'user-4',
    feePerPerson: 1200,
    maxSeats: 10,
    currentSeats: 8,
    dateTime: '2026-08-12T19:00:00.000Z',
    location: 'Downtown Kitchen',
    locationDetail: 'SoHo, NY',
    rating: 4.9,
    reviewCount: 124,
    status: 'PENDING',
    refundPolicy: '24h Refund',
    attendeeIds: ['user-1', 'user-2', 'user-3'],
    createdAt: new Date().toISOString(),
  },
];

seedPods.forEach((p) => pods.set(p.id, p));

export function getPaginatedPods(input: PodPaginationInput): PaginatedPods {
  let items = [...pods.values()];

  if (input.category && input.category !== 'All') {
    items = items.filter((p) => p.category.toLowerCase() === input.category!.toLowerCase());
  }
  if (input.search) {
    const q = input.search.toLowerCase();
    items = items.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }

  const sortBy = input.sortBy ?? 'createdAt';
  const order = input.order ?? 'DESC';
  items.sort((a, b) => {
    const aVal = String(a[sortBy as keyof Pod] ?? '');
    const bVal = String(b[sortBy as keyof Pod] ?? '');
    return order === 'ASC' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const total = items.length;
  const totalPages = Math.ceil(total / input.limit);
  const start = (input.page - 1) * input.limit;
  items = items.slice(start, start + input.limit);

  return { items, total, page: input.page, limit: input.limit, totalPages };
}

export function getPodById(id: string): Pod | undefined {
  return pods.get(id);
}

export function getMyPods(hostId: string): Pod[] {
  return [...pods.values()].filter((p) => p.hostId === hostId);
}

export function createPod(input: CreatePodInput, hostId: string): Pod {
  const pod: Pod = {
    id: uuidv4(),
    title: input.title,
    description: input.description,
    category: input.category,
    imageUrl: input.imageUrl ?? 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800',
    hostId,
    feePerPerson: input.feePerPerson,
    maxSeats: input.maxSeats,
    dateTime: input.dateTime,
    location: input.location,
    locationDetail: input.locationDetail,
    refundPolicy: input.refundPolicy ?? '24h Refund',
    currentSeats: 0,
    attendeeIds: [],
    rating: 0,
    reviewCount: 0,
    status: 'NEW',
    createdAt: new Date().toISOString(),
  };
  pods.set(pod.id, pod);
  return pod;
}

export function updatePod(id: string, hostId: string, input: UpdatePodInput): Pod {
  const pod = pods.get(id);
  if (!pod) throw new Error('Pod not found');
  if (pod.hostId !== hostId) throw new Error('You can only update your own pods');
  if (input.title !== undefined) pod.title = input.title;
  if (input.description !== undefined) pod.description = input.description;
  if (input.category !== undefined) pod.category = input.category;
  if (input.imageUrl !== undefined) pod.imageUrl = input.imageUrl;
  if (input.feePerPerson !== undefined) pod.feePerPerson = input.feePerPerson;
  if (input.maxSeats !== undefined) pod.maxSeats = input.maxSeats;
  if (input.dateTime !== undefined) pod.dateTime = input.dateTime;
  if (input.location !== undefined) pod.location = input.location;
  if (input.locationDetail !== undefined) pod.locationDetail = input.locationDetail;
  pods.set(pod.id, pod);
  return pod;
}

export function deletePod(id: string): boolean {
  return pods.delete(id);
}

export function joinPod(podId: string, userId: string): Pod {
  const pod = pods.get(podId);
  if (!pod) throw new Error('Pod not found');
  if (pod.currentSeats >= pod.maxSeats) throw new Error('Pod is full');
  if (pod.attendeeIds.includes(userId)) throw new Error('Already joined this pod');
  pod.attendeeIds.push(userId);
  pod.currentSeats += 1;
  pods.set(pod.id, pod);
  return pod;
}

export function leavePod(podId: string, userId: string): Pod {
  const pod = pods.get(podId);
  if (!pod) throw new Error('Pod not found');
  const idx = pod.attendeeIds.indexOf(userId);
  if (idx === -1) throw new Error('Not a member of this pod');
  pod.attendeeIds.splice(idx, 1);
  pod.currentSeats -= 1;
  pods.set(pod.id, pod);
  return pod;
}

export function resolveHost(hostId: string) {
  return findUserById(hostId);
}

export function resolveAttendees(attendeeIds: string[]) {
  return attendeeIds.map((id) => findUserById(id)).filter(Boolean);
}
