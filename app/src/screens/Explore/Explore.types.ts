export interface Pod {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  mediaUrls?: string[];
  feePerPerson: number;
  location: string;
  locationDetail: string;
  maxSeats: number;
  currentSeats: number;
  dateTime: string;
  status: string;
  rating: number;
  reviewCount: number;
  host: { id: string; name: string; avatar: string; isVerifiedHost: boolean };
  attendees?: { id: string }[];
}

export interface PodNavigationCallback {
  (podId: string): void;
}

export interface ExploreScreenProps {
  onPodPress?: PodNavigationCallback;
  onCheckout?: PodNavigationCallback;
}

const VIDEO_EXTS = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v'];

export function isVideoUrl(url: string): boolean {
  const path = url.split('?')[0].toLowerCase();
  return VIDEO_EXTS.some((ext) => path.endsWith(ext));
}

export function getMediaCounts(pod: Pod): { images: number; videos: number } {
  const allUrls: string[] = [];
  if (pod.imageUrl && pod.imageUrl.trim().length > 0) allUrls.push(pod.imageUrl);
  if (pod.mediaUrls) {
    pod.mediaUrls.forEach((url) => {
      if (url && url.trim().length > 0 && !allUrls.includes(url)) allUrls.push(url);
    });
  }
  let images = 0;
  let videos = 0;
  allUrls.forEach((url) => {
    if (isVideoUrl(url)) videos++;
    else images++;
  });
  return { images, videos };
}

export function getSortedMedia(pod: Pod): string[] {
  const allUrls: string[] = [];
  if (pod.imageUrl && pod.imageUrl.trim().length > 0) allUrls.push(pod.imageUrl);
  if (pod.mediaUrls) {
    pod.mediaUrls.forEach((url) => {
      if (url && url.trim().length > 0 && !allUrls.includes(url)) allUrls.push(url);
    });
  }
  const videoUrls = allUrls.filter((url) => isVideoUrl(url));
  const imageUrls = allUrls.filter((url) => !isVideoUrl(url));
  return [...videoUrls, ...imageUrls];
}

export const formatDate = (d: string): string => {
  const dt = new Date(d);
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatTime = (d: string): string => {
  const dt = new Date(d);
  return dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};
