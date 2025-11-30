
import { User, PricingPackage, AppConfig, PromoCode, AdminProfile, Offer } from '../types';

const KEYS = {
  USERS: 'dream_body_users',
  PACKAGES: 'dream_body_packages',
  PROMOS: 'dream_body_promos',
  OFFERS: 'dream_body_offers',
  CONFIG: 'dream_body_config',
  SESSION: 'dream_body_session',
};

const DEFAULT_PACKAGES: PricingPackage[] = [
  {
    id: '1',
    name: 'Monthly Transformation',
    price: '500',
    durationMonths: 1,
    features: ['Custom Diet Plan', 'Workout Routine', 'Weekly Check-ins', '24/7 Support'],
  },
  {
    id: '2',
    name: 'Quarterly Beast Mode',
    price: '900',
    durationMonths: 3,
    features: ['All Monthly Features', 'Advanced Supplement Guide', 'Priority Support', 'Video Form Analysis'],
  },
];

const DEFAULT_ADMIN: AdminProfile = {
  id: 'SO3DA2007',
  email: 'admin@dreambody.com',
  phone: '0000000000',
  password: 'Ahly2007.com'
};

// --- Helpers ---
const generateId = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// --- Initialization ---
export const initStorage = () => {
  if (!localStorage.getItem(KEYS.PACKAGES)) {
    localStorage.setItem(KEYS.PACKAGES, JSON.stringify(DEFAULT_PACKAGES));
  }
  if (!localStorage.getItem(KEYS.CONFIG)) {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify({ admin: DEFAULT_ADMIN }));
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.PROMOS)) {
    localStorage.setItem(KEYS.PROMOS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.OFFERS)) {
    localStorage.setItem(KEYS.OFFERS, JSON.stringify([]));
  }
};

// --- Auth ---
export const authenticate = (identifier: string, password: string): { role: 'ADMIN' | 'CLIENT', user?: User } | null => {
  const config = getAppConfig();
  const users = getUsers();
  
  // 1. ID ONLY AUTHENTICATION (Password ignored for ID match)
  // Admin Code Check
  if (config.admin.id === identifier) {
      return { role: 'ADMIN' };
  }
  // User ID Check
  const userById = users.find(u => u.id === identifier);
  if (userById) {
      return { role: 'CLIENT', user: userById };
  }

  // 2. CREDENTIAL AUTHENTICATION (Email/Phone + Password)
  // Admin Credential Check
  if (
    (config.admin.email === identifier || config.admin.phone === identifier) && 
    config.admin.password === password
  ) {
    return { role: 'ADMIN' };
  }

  // User Credential Check
  const user = users.find(u => 
    (u.email === identifier || u.phone === identifier) && 
    u.password === password
  );

  if (user) {
    return { role: 'CLIENT', user };
  }

  return null;
};

// --- User Management ---
export const getUsers = (): User[] => {
  const data = localStorage.getItem(KEYS.USERS);
  return data ? JSON.parse(data) : [];
};

export const getUser = (id: string): User | undefined => {
  const users = getUsers();
  return users.find((u) => u.id === id);
};

export const createUser = (data: Partial<User>): User => {
  const users = getUsers();

  // Validation: Check for duplicates
  if (data.email && users.some(u => u.email.toLowerCase() === data.email?.toLowerCase())) {
      throw new Error("A user with this Email already exists.");
  }
  if (data.phone && users.some(u => u.phone === data.phone)) {
      throw new Error("A user with this Phone number already exists.");
  }

  let id = generateId();
  while (users.some((u) => u.id === id)) {
    id = generateId();
  }

  const newUser: User = {
    id,
    name: data.name || 'New User',
    email: data.email || '',
    phone: data.phone || '',
    gender: data.gender || 'MALE',
    password: data.password || generateId(),
    dob: data.dob || new Date().toISOString().split('T')[0],
    height: data.height,
    currentWeight: data.currentWeight,
    createdAt: new Date().toISOString(),
    
    // Default to Inactive until Admin activates
    isActive: false, 
    walletBalance: 0, // Default wallet balance
    
    weightHistory: [],
    workoutPlan: 'No workout plan assigned yet. Contact coach to activate.',
    dietPlan: 'No diet plan assigned yet. Contact coach to activate.',
    notes: '',
    seenOffers: {},
    
    // Initialize as undefined/null
    payment: undefined,
    pendingRequest: undefined
  };

  users.push(newUser);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  return newUser;
};

export const updateUser = (updatedUser: User): void => {
  const users = getUsers();
  const index = users.findIndex((u) => u.id === updatedUser.id);
  
  if (index !== -1) {
    users[index] = updatedUser;
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  }
};

export const updateUserWithIdChange = (oldId: string, updatedUser: User): void => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === oldId);
  if (index !== -1) {
    users[index] = updatedUser;
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  }
};

export const deleteUser = (id: string): void => {
  const users = getUsers().filter((u) => u.id !== id);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
};

export const markOfferSeen = (userId: string, offerId: string) => {
    const user = getUser(userId);
    if (user) {
        const currentCount = user.seenOffers?.[offerId] || 0;
        const updatedUser = {
            ...user,
            seenOffers: {
                ...user.seenOffers,
                [offerId]: currentCount + 1
            }
        };
        updateUser(updatedUser);
    }
};

export const updateWalletBalance = (userId: string, amountToAdd: number) => {
    const user = getUser(userId);
    if (user) {
        const newBalance = (user.walletBalance || 0) + amountToAdd;
        updateUser({ ...user, walletBalance: newBalance });
    }
};

// --- Config / Admin ---
export const getAppConfig = (): AppConfig => {
  const data = localStorage.getItem(KEYS.CONFIG);
  return data ? JSON.parse(data) : { admin: DEFAULT_ADMIN };
};

export const updateAdminProfile = (profile: AdminProfile): void => {
  const config = { admin: profile };
  localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
};

// --- Pricing ---
export const getPackages = (): PricingPackage[] => {
  const data = localStorage.getItem(KEYS.PACKAGES);
  return data ? JSON.parse(data) : DEFAULT_PACKAGES;
};

export const savePackages = (packages: PricingPackage[]): void => {
  localStorage.setItem(KEYS.PACKAGES, JSON.stringify(packages));
};

// --- Promo Codes ---
export const getPromoCodes = (): PromoCode[] => {
  const data = localStorage.getItem(KEYS.PROMOS);
  return data ? JSON.parse(data) : [];
};

export const savePromoCode = (code: PromoCode): void => {
  const codes = getPromoCodes();
  // Ensure default values for new fields if missing in legacy data
  if (code.maxUsage === undefined) code.maxUsage = 9999;
  if (code.currentUsage === undefined) code.currentUsage = 0;
  if (code.type === undefined) code.type = 'DISCOUNT';
  
  codes.push(code);
  localStorage.setItem(KEYS.PROMOS, JSON.stringify(codes));
};

export const deletePromoCode = (id: string): void => {
  const codes = getPromoCodes().filter(c => c.id !== id);
  localStorage.setItem(KEYS.PROMOS, JSON.stringify(codes));
};

export const redeemCreditPromo = (userId: string, promoCode: string): { success: boolean, message: string } => {
    const codes = getPromoCodes();
    const codeIndex = codes.findIndex(c => c.code === promoCode && c.type === 'CREDIT');
    
    if (codeIndex === -1) return { success: false, message: 'Invalid or non-credit code.' };
    
    const code = codes[codeIndex];
    if (new Date(code.deadline) < new Date()) return { success: false, message: 'Promo code expired.' };
    if (code.currentUsage >= code.maxUsage) return { success: false, message: 'Promo code usage limit reached.' };

    // Update Usage
    code.currentUsage += 1;
    codes[codeIndex] = code;
    localStorage.setItem(KEYS.PROMOS, JSON.stringify(codes));

    // Update Wallet
    const amount = parseFloat(code.discount);
    updateWalletBalance(userId, amount);

    return { success: true, message: `${amount} EGY added to wallet!` };
};

export const incrementPromoUsage = (promoCode: string) => {
    const codes = getPromoCodes();
    const codeIndex = codes.findIndex(c => c.code === promoCode);
    if (codeIndex !== -1) {
        codes[codeIndex].currentUsage += 1;
        localStorage.setItem(KEYS.PROMOS, JSON.stringify(codes));
    }
};

// --- Offers / Ads ---
export const getOffers = (): Offer[] => {
  const data = localStorage.getItem(KEYS.OFFERS);
  return data ? JSON.parse(data) : [];
};

export const saveOffer = (offer: Offer): void => {
  const offers = getOffers();
  offers.push(offer);
  localStorage.setItem(KEYS.OFFERS, JSON.stringify(offers));
};

export const deleteOffer = (id: string): void => {
  const offers = getOffers().filter(o => o.id !== id);
  localStorage.setItem(KEYS.OFFERS, JSON.stringify(offers));
};


// --- Session ---
export const getSession = (): { type: 'ADMIN' | 'CLIENT'; userId?: string } | null => {
  const session = localStorage.getItem(KEYS.SESSION);
  if (!session) return null;
  return JSON.parse(session);
};

export const setSession = (type: 'ADMIN' | 'CLIENT', userId?: string) => {
  localStorage.setItem(KEYS.SESSION, JSON.stringify({ type, userId }));
};

export const clearSession = () => {
  localStorage.removeItem(KEYS.SESSION);
};

export const addWeightEntry = (userId: string, weight: number) => {
    const user = getUser(userId);
    if(user) {
        const today = new Date().toISOString().split('T')[0];
        const newHistory = [...user.weightHistory, { date: today, weight }];
        updateUser({
            ...user,
            currentWeight: weight,
            weightHistory: newHistory
        });
    }
}
