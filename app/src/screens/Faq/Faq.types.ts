export interface Policy {
  id: string;
  type: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

export type TabKey = 'faq' | 'user' | 'venue' | 'host' | 'support' | 'callback';

export interface FaqScreenProps {
  onBack: () => void;
  onNavigateSupport?: () => void;
  initialTab?: TabKey;
}

export interface TabItem {
  key: TabKey;
  label: string;
  icon: string;
}

export const FAQ_ITEMS = [
  { q: 'What is a Pod?', a: 'A Pod is a group experience hosted by a verified host at a chosen venue. You can join Pods to attend events, meetups, or activities near you.' },
  { q: 'How do I join a Pod?', a: 'Browse available Pods on the Explore tab. Tap on a Pod to see its details, then tap "Join" to reserve your spot.' },
  { q: 'Can I cancel my booking?', a: 'Yes. Check the Pod\'s refund policy for specifics. Most Pods offer a 24-hour refund window.' },
  { q: 'How do I become a Host?', a: 'Go to your Profile and apply for Host verification. Once approved, you can create Pods and invite guests.' },
  { q: 'Is my payment secure?', a: 'All payments are processed through secure payment gateways. We never store your card details.' },
  { q: 'How do I contact support?', a: 'Visit the Help & Support section in your profile or use the Support page to submit a query.' },
];

export const TABS: TabItem[] = [
  { key: 'faq', label: 'FAQs', icon: 'help-outline' },
  { key: 'user', label: 'User Policy', icon: 'person' },
  { key: 'venue', label: 'Venue Policy', icon: 'place' },
  { key: 'host', label: 'Host Policy', icon: 'verified-user' },
  { key: 'support', label: 'Support Tickets', icon: 'support-agent' },
  { key: 'callback', label: 'Request Callback', icon: 'phone-callback' },
];
