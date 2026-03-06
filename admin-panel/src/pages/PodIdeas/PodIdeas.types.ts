export interface PodIdeaUser {
  id: string;
  name: string;
  phone: string;
}

export interface PodIdeaItem {
  id: string;
  userId: string;
  user: PodIdeaUser | null;
  title: string;
  description: string;
  category: string;
  location: string;
  estimatedBudget: string;
  status: string;
  adminNotes: string | null;
  upvoteCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPodIdeas {
  podIdeas: {
    items: PodIdeaItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const POD_IDEA_STATUS_COLORS: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
};
