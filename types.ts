
export interface PricingPackage {
  id: string;
  name: string;
  price: string;
  durationMonths: number;
  features: string[];
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'DISCOUNT' | 'CREDIT'; // DISCOUNT reduces price, CREDIT adds to wallet
  discount: string; // e.g. "10%" or "100" (fixed amount/value)
  deadline: string;
  applicablePackageIds?: string[]; // IDs of packages this code works on
  maxUsage: number;
  currentUsage: number;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  showLimit: number;
  isActive: boolean;
}

export type PaymentMethod = 'INSTAPAY' | 'WALLET';

export interface PaymentDetails {
  transactionId: string;
  method: PaymentMethod;
  date: string;
  senderPhone?: string; // For Wallet payments
}

export interface PendingRequest {
  packageId: string;
  packageName: string;
  requestedPrice: string;
  promoCodeUsed?: string;
  requestDate: string;
  walletUsed: number;     // Amount to be paid from wallet
  remainingAmount: number; // Amount to be paid via external transaction
}

export interface User {
  id: string; // Login ID
  password: string;
  name: string;
  email: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
  dob: string; // YYYY-MM-DD
  createdAt: string;
  
  // Wallet
  walletBalance: number;

  // Physical Stats
  height?: number; // cm
  currentWeight?: number; // kg
  weightHistory: WeightEntry[];
  
  // Subscription
  subscriptionStart?: string;
  subscriptionEnd?: string;
  isActive: boolean;
  
  // Payment & Request
  payment?: PaymentDetails;
  pendingRequest?: PendingRequest;

  // Plans
  workoutPlan: string;
  dietPlan: string;
  notes: string;

  // Ads
  seenOffers: Record<string, number>;
}

export interface AdminProfile {
  id: string;
  email: string;
  phone: string;
  password: string;
}

export interface AppConfig {
  admin: AdminProfile;
}

export type ViewState = 'PUBLIC' | 'LOGIN' | 'ADMIN' | 'CLIENT';
