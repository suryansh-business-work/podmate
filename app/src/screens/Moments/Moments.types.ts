export interface MomentUser {
  id: string;
  name: string;
  avatar: string;
  username: string;
}

export interface MomentItem {
  id: string;
  user: MomentUser;
  caption: string;
  mediaUrls: string[];
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
}

export interface PaginatedMomentsData {
  moments: {
    items: MomentItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MomentCommentItem {
  id: string;
  momentId: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
}
