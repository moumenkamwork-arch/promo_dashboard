/** API envelope + data models — mirror the Promoo REST backend exactly. */

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message: string;
  meta?: ApiMeta;
}

export interface ApiError {
  success: false;
  data: null;
  message: string;
  error: { code: string; details?: unknown };
}

export type AccountType = 'company' | 'influencer' | 'service_provider' | 'user';

export interface Profile {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  account_type: AccountType;
  is_verified: boolean;
  is_featured: boolean;
  is_active: boolean;
  is_admin: boolean;
  category_id: string | null;
  location: string | null;
  followers_count: number;
  created_at: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}

export interface LoginResponse {
  user?: { id: string; email?: string };
  session: Session;
  profile?: Profile;
}

export type OfferStatus = 'draft' | 'active' | 'expired' | 'rejected';
export interface Offer {
  id: string;
  profile_id: string;
  category_id: string | null;
  title: string;
  description: string;
  original_price: number | null;
  offer_price: number;
  discount_percentage: number | null;
  currency: string;
  media_urls: string[];
  start_date: string | null;
  end_date: string | null;
  status: OfferStatus;
  is_featured: boolean;
  views_count: number;
  tags: string[];
  created_at: string;
  profile?: Partial<Profile>;
  category?: { id: string; name_en: string; name_ar: string; slug: string };
}

export type AdStatus = 'pending' | 'active' | 'paused' | 'completed' | 'rejected';
export interface Ad {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  media_url: string | null;
  ad_type: string;
  status: AdStatus;
  phone: string | null;
  whatsapp: string | null;
  contact_email: string | null;
  city: string | null;
  price: number | null;
  currency: string | null;
  impressions: number;
  clicks: number;
  tags: string[];
  created_at: string;
  profile?: Partial<Profile>;
}

export interface Service {
  id: string;
  profile_id: string;
  category_id: string | null;
  title: string;
  description: string;
  price: number;
  currency: string;
  status: string;
  views_count: number;
  created_at: string;
  profile?: Partial<Profile>;
  category?: { id: string; name_en: string; name_ar: string; slug: string };
}

export type PlanInterval = 'monthly' | 'quarterly' | 'yearly';
export interface SubscriptionPlan {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  price: number;
  currency: string;
  interval: PlanInterval;
  stripe_price_id: string;
  sort_order: number;
  features_ar: string[];
  features_en: string[];
  is_active: boolean;
}

export type PaymentStatus = 'succeeded' | 'pending' | 'failed' | 'refunded';
export type PaymentType = 'subscription' | 'ad' | 'featured';
export interface Payment {
  id: string;
  profile_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  type: PaymentType;
  stripe_payment_id: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
  profile?: Partial<Profile>;
}

export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';
export type ReportedType = 'profile' | 'offer' | 'ad' | 'message' | 'service' | 'story' | 'seat';
export interface Report {
  id: string;
  reporter_id: string;
  reported_id: string;
  reported_type: ReportedType;
  reason: string;
  details: string | null;
  status: ReportStatus;
  admin_note: string | null;
  created_at: string;
  reporter?: Partial<Profile>;
}

export interface Category {
  id: string;
  name_ar: string;
  name_en: string;
  slug: string;
  icon_url: string | null;
  sort_order: number;
}

export interface AdminStats {
  totalUsers: number;
  activeAds: number;
  pendingReports: number;
  totalRevenue: number;
}

export interface LeaderboardEntry extends Partial<Profile> {
  id: string;
  rank: number;
  followers_count: number;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  account_type: AccountType;
  is_verified: boolean;
}
