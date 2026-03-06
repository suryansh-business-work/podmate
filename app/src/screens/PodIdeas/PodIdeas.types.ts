export interface PodIdeaUser {
  id: string;
  name: string;
  avatar: string;
}

export interface PodIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  estimatedBudget: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  upvoteCount: number;
  hasUpvoted: boolean;
  user: PodIdeaUser;
  createdAt: string;
}

export interface PodIdeasScreenProps {
  onBack: () => void;
}

export interface PodIdeaFormValues {
  title: string;
  description: string;
  category: string;
  location: string;
  budget: string;
}
