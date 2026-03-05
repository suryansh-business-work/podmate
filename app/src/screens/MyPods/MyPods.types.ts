export interface MyPodItem {
  id: string;
  title: string;
  imageUrl: string;
  mediaUrls?: string[];
  category: string;
  status: string;
}

export interface MyPodsScreenProps {
  onBack: () => void;
  onPodPress: (id: string) => void;
}
