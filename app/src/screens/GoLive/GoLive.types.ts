export interface LiveSessionHost {
  id: string;
  name: string;
  avatar: string;
}

export interface LiveSessionPod {
  id: string;
  title: string;
}

export interface LiveSession {
  id: string;
  title: string;
  description: string;
  status: 'LIVE' | 'ENDED';
  viewerCount: number;
  isViewing: boolean;
  host: LiveSessionHost;
  pod: LiveSessionPod;
  startedAt: string;
}

export interface GoLiveScreenProps {
  onBack: () => void;
  onViewSession?: (sessionId: string) => void;
}
