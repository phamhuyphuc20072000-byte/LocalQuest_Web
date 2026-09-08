// ============================================================================
// LOCALQUEST DESIGN SYSTEM & DATA CONTRACTS (100% Android Room & Web Parity)
// ============================================================================

export type UserRole = 'tourist' | 'guide' | 'admin';

export type QuestTheme = 'Ẩm thực' | 'Lịch sử' | 'Bí ẩn' | 'Đêm' | 'Văn hóa' | 'Tất cả';

export type QuestDifficulty = 'Dễ' | 'Trung bình' | 'Khó' | 'Thử thách';

export interface Waypoint {
  id: number;
  lat: number;
  lng: number;
  name: string;
  script: string;
  question: string;
  answers: string[];
  correct: number;
  hint?: string;
  photoSpotPrompt?: string;
  order?: number;
}

export interface QuizQuestion {
  id: string;
  waypointId: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
}

export interface Quest {
  id: number | string;
  name: string;
  city: string;
  theme: Exclude<QuestTheme, 'Tất cả'>;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  difficulty: QuestDifficulty | string;
  walkTime: string;
  distance: string;
  imageId: string;
  teaser: string;
  story: string;
  guideName: string;
  guideRating: number;
  guideImageId: string;
  guideBadge?: string;
  lat?: number;
  lng?: number;
  waypoints: Waypoint[];
  tags?: string[];
  featured?: boolean;
  rewardPoints?: number;
  status?: 'active' | 'pending' | 'rejected';
  isApproved?: boolean;
  startDate?: string;
  departureTimes?: string[];
}

export interface Ticket {
  id: string;
  ticketCode: string;
  questId: number | string;
  questName: string;
  city: string;
  theme: string;
  price: number;
  purchaseDate: string;
  playDate?: string;
  departureTime?: string;
  touristsCount: number;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  status: 'valid' | 'used' | 'expired' | 'playing' | 'completed';
  currentWaypointIndex?: number;
  score?: number;
  qrPayload: string;
}

export interface GuideProfile {
  id: string;
  uid?: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  bio: string;
  avatarUrl: string;
  rating: number;
  totalQuests: number;
  totalTourists: number;
  balanceVnd: number;
  pendingBalanceVnd: number;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  idCardNumber?: string;
  status: 'pending' | 'verified' | 'rejected' | 'approved';
  submittedDate: string;
  specialties: string[];
}

export interface WalletTransaction {
  id: string;
  type: 'earning' | 'withdrawal' | 'bonus' | 'refund';
  amount: number;
  description: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  referenceId?: string;
  bankInfo?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: UserRole;
  points: number;
  exp?: number;
  localCoins?: number;
  completedQuests: (number | string)[];
  savedQuests: (number | string)[];
  joinedDate: string;
  phone?: string;
  providerId?: string;
  isAnonymous?: boolean;
  badges?: Badge[];
  updatedAt?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  category: 'food' | 'heritage' | 'nature' | 'explorer' | 'community';
}

export interface LegacyQuest {
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

export interface PendingWithdrawal {
  id: number | string;
  guideId?: string;
  guide: string;
  amount: number;
  bank: string;
  account: string;
  requested: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface PendingQuestReview {
  id: number | string;
  name: string;
  guide: string;
  city: string;
  waypoints: number;
  submitted: string;
  theme: string;
  price: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface PendingGuideApplication {
  id: number;
  name: string;
  city: string;
  submitted: string;
  phone: string;
  email?: string;
  bio?: string;
  isNew: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

export type ActivePage =
  | 'EXPLORE'
  | 'QUEST_DETAIL'
  | 'CHECKOUT'
  | 'MY_TICKETS'
  | 'GAMEPLAY'
  | 'GUIDE_LANDING'
  | 'GUIDE_REGISTER'
  | 'GUIDE_STUDIO'
  | 'QUEST_CREATOR'
  | 'GUIDE_WALLET'
  | 'ADMIN_LOGIN'
  | 'ADMIN_DASHBOARD';
