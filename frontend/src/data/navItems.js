import { 
  Home, 
  Sprout, 
  Clock3, 
  CalendarClock, 
  CreditCard, 
  Bell, 
  User,
  Building2,
  LineChart,
  TriangleAlert,
  Users,
  Cpu,
  HeadphonesIcon,
  MessageSquare,
} from 'lucide-react';

export const farmerNavItems = [
  { label: 'Dashboard', labelTa: 'முகப்பு', to: '/farmer-dashboard', icon: Home },
  { label: 'Add crop', labelTa: 'பயிர் சேர்க்க', to: '/farmer-dashboard/add-crop', icon: Sprout },
  { label: 'Live queue', labelTa: 'நேரலை வரிசை', to: '/farmer-dashboard/live-queue', icon: Clock3 },
  { label: 'Procurement timeline', labelTa: 'கொள்முதல் காலவரிசை', to: '/farmer-dashboard/timeline', icon: CalendarClock },
  { label: 'Payments', labelTa: 'பணம் செலுத்துதல்', to: '/farmer-dashboard/payments', icon: CreditCard },
  { label: 'Notifications', labelTa: 'அறிவிப்புகள்', to: '/farmer-dashboard/notifications', icon: Bell },
  { label: 'Profile', labelTa: 'சுயவிவரம்', to: '/farmer-dashboard/profile', icon: User },
  { label: 'Customer Support', labelTa: 'வாடிக்கையாளர் ஆதரவு', to: '/farmer-dashboard/support', icon: HeadphonesIcon },
];

export const officerNavItems = [
  { label: 'Dashboard', labelTa: 'முகப்பு', to: '/officer-dashboard', icon: Home },
  { label: 'Centers', labelTa: 'கொள்முதல் மையங்கள்', to: '/officer-dashboard/centers', icon: Building2 },
  { label: 'AI demand forecast', labelTa: 'AI தேவை முன்கணிப்பு', to: '/officer-dashboard/demand-forecast', icon: LineChart },
  { label: 'Overload risk', labelTa: 'நெரிசல் அபாய நிலை', to: '/officer-dashboard/overload-risk', icon: TriangleAlert },
  { label: 'Farmer allocation', labelTa: 'விவசாயிகள் ஒதுக்கீடு', to: '/officer-dashboard/farmer-allocation', icon: Users },
  { label: 'Digital twin', labelTa: 'டிஜிட்டல் ட்வின்', to: '/officer-dashboard/digital-twin', icon: Cpu },
  { label: 'Payments', labelTa: 'பணம் வழங்கல்', to: '/officer-dashboard/payments', icon: CreditCard },
  { label: 'Received queries', labelTa: 'விவசாயிகள் புகார்கள்', to: '/officer-dashboard/queries', icon: MessageSquare },
  { label: 'Notifications', labelTa: 'அறிவிப்புகள்', to: '/officer-dashboard/notifications', icon: Bell },
  { label: 'Profile', labelTa: 'சுயவிவரம்', to: '/officer-dashboard/profile', icon: User },
];
