// Access control utilities for tier-based feature gating

export type UserTier = 'public' | 'member' | 'contributor' | 'admin';

export interface User {
  id: number;
  type?: string; // For public_users
  user_tier?: UserTier; // For members
  subscription_status?: string;
  full_name: string;
  email?: string;
  phone_number?: string;
}

// Feature access definitions
export const FEATURE_ACCESS = {
  // Free features (all tiers)
  browseBills: ['public', 'member', 'contributor', 'admin'],
  viewLegislators: ['public', 'member', 'contributor', 'admin'],
  searchLegislation: ['public', 'member', 'contributor', 'admin'],
  readIssues: ['public', 'member', 'contributor', 'admin'],
  
  // Member features (paid)
  trackBills: ['member', 'contributor', 'admin'],
  emailNotifications: ['member', 'contributor', 'admin'],
  commentOnIssues: ['member', 'contributor', 'admin'],
  personalizedDashboard: ['member', 'contributor', 'admin'],
  
  // Contributor features
  submitIssues: ['contributor', 'admin'],
  issueAnalytics: ['contributor', 'admin'],
  
  // Admin features
  manageUsers: ['admin'],
  manageContent: ['admin'],
  viewAnalytics: ['admin'],
};

/**
 * Check if user has access to a feature
 */
export function hasAccess(user: User | null, feature: keyof typeof FEATURE_ACCESS): boolean {
  if (!user) return FEATURE_ACCESS[feature].includes('public');
  
  const userTier = getUserTier(user);
  return FEATURE_ACCESS[feature].includes(userTier);
}

/**
 * Get user tier from user object
 */
export function getUserTier(user: User): UserTier {
  // Public users
  if (user.type === 'public') return 'public';
  
  // Members with tier field
  if (user.user_tier) {
    // Check if subscription is active for paid tiers
    if (user.user_tier !== 'public' && user.subscription_status !== 'active') {
      return 'public'; // Downgrade to public if subscription inactive
    }
    return user.user_tier;
  }
  
  // Default to public
  return 'public';
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: UserTier): string {
  const names = {
    public: 'Public User',
    member: 'Member',
    contributor: 'Contributor',
    admin: 'Administrator',
  };
  return names[tier];
}

/**
 * Get tier badge color
 */
export function getTierBadgeColor(tier: UserTier): string {
  const colors = {
    public: 'bg-gray-100 text-gray-800',
    member: 'bg-blue-100 text-blue-800',
    contributor: 'bg-purple-100 text-purple-800',
    admin: 'bg-red-100 text-red-800',
  };
  return colors[tier];
}

/**
 * Check if user needs to upgrade for a feature
 */
export function needsUpgrade(user: User | null, feature: keyof typeof FEATURE_ACCESS): {
  needsUpgrade: boolean;
  requiredTier?: UserTier;
  message?: string;
} {
  if (hasAccess(user, feature)) {
    return { needsUpgrade: false };
  }
  
  const allowedTiers = FEATURE_ACCESS[feature];
  const lowestTier = allowedTiers[0] as UserTier;
  
  const messages: Record<string, string> = {
    member: 'This feature requires a Member subscription. Upgrade to track bills, get notifications, and engage with the community.',
    contributor: 'This feature requires a Contributor subscription. Upgrade to submit issues and access advanced features.',
    admin: 'This feature is only available to administrators.',
  };
  
  return {
    needsUpgrade: true,
    requiredTier: lowestTier,
    message: messages[lowestTier] || 'This feature requires an upgrade.',
  };
}

/**
 * Get upgrade CTA for a feature
 */
export function getUpgradeCTA(feature: keyof typeof FEATURE_ACCESS): {
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
} {
  const allowedTiers = FEATURE_ACCESS[feature];
  const lowestTier = allowedTiers[0] as UserTier;
  
  if (lowestTier === 'member') {
    return {
      title: 'Upgrade to Member',
      description: 'Get full access to bill tracking, notifications, and community engagement.',
      ctaText: 'View Membership Plans',
      ctaLink: '/pricing',
    };
  }
  
  if (lowestTier === 'contributor') {
    return {
      title: 'Become a Contributor',
      description: 'Submit issues, get featured, and access advanced analytics.',
      ctaText: 'View Contributor Plans',
      ctaLink: '/pricing',
    };
  }
  
  return {
    title: 'Access Restricted',
    description: 'This feature is not available for your account.',
    ctaText: 'Learn More',
    ctaLink: '/pricing',
  };
}
