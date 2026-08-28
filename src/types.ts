export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  providerId: string;
  isAnonymous?: boolean;
  role?: 'tourist' | 'local_host' | 'admin';
  points: number;
  completedQuests: string[];
  savedQuests: string[];
  badges: Badge[];
  joinedDate: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  category: 'food' | 'heritage' | 'nature' | 'explorer' | 'community';
}

export interface Checkpoint {
  id: string;
  title: string;
  description: string;
  locationName: string;
  coordinates: { lat: number; lng: number };
  taskDescription: string;
  localTip: string;
  estimatedMinutes: number;
  order: number;
  photoSpotPrompt?: string;
}

export interface Quest {
  id: string;
  title: string;
  destination: string;
  region: 'Miền Bắc' | 'Miền Trung' | 'Miền Nam' | 'Quốc tế';
  category: 'Ẩm thực' | 'Di sản & Văn hoá' | 'Thiên nhiên & Sinh thái' | 'Nghệ thuật & Thủ công' | 'Đời sống Bản địa';
  summary: string;
  detailedStory: string;
  heroImage: string;
  galleryImages: string[];
  durationHours: number;
  distanceKm: number;
  difficulty: 'Dễ dàng' | 'Trung bình' | 'Thử thách';
  rating: number;
  reviewCount: number;
  priceVnd: number;
  hostName: string;
  hostAvatar: string;
  hostBadge: string;
  checkpoints: Checkpoint[];
  tags: string[];
  featured?: boolean;
  rewardPoints: number;
  badgeRewardId?: string;
}

export interface FirebaseCustomConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

export interface AuthDiagnosticResult {
  code: string;
  message: string;
  technicalDetails?: string;
  severity: 'error' | 'warning' | 'success' | 'info';
  solutionSteps: string[];
  helpLink?: string;
  suggestedAction?: 'add_domain' | 'enable_provider' | 'check_oauth' | 'retry_popup' | 'use_demo';
}

export interface BookingRecord {
  id: string;
  userId?: string;
  userEmail?: string;
  questId: string;
  questTitle: string;
  destination: string;
  bookingDate: string;
  touristsCount: number;
  totalPriceVnd: number;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  contactEmail: string;
  contactName: string;
  createdAt?: string;
}
