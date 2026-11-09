export type UserRole = 'buyer' | 'seller' | 'agent' | 'operator' | 'business-admin' | 'system-admin';

export interface UserPermissions {
  canManageProducts: boolean;
  canManageOrders: boolean;
  canManageInventory: boolean;
  canManageUsers: boolean;
  canManageSystemConfig: boolean;
  canManageBusinessConfig: boolean;
  canViewFinancials: boolean;
  canManagePricing: boolean;
}

export const rolePermissions: Record<UserRole, UserPermissions> = {
  buyer: {
    canManageProducts: false,
    canManageOrders: false,
    canManageInventory: false,
    canManageUsers: false,
    canManageSystemConfig: false,
    canManageBusinessConfig: false,
    canViewFinancials: false,
    canManagePricing: false,
  },
  seller: {
    canManageProducts: true,
    canManageOrders: true,
    canManageInventory: true,
    canManageUsers: false,
    canManageSystemConfig: false,
    canManageBusinessConfig: false,
    canViewFinancials: true,
    canManagePricing: true,
  },
  agent: {
    canManageProducts: false,
    canManageOrders: true,
    canManageInventory: false,
    canManageUsers: false,
    canManageSystemConfig: false,
    canManageBusinessConfig: false,
    canViewFinancials: false,
    canManagePricing: false,
  },
  operator: {
    canManageProducts: true,
    canManageOrders: true,
    canManageInventory: true,
    canManageUsers: false,
    canManageSystemConfig: false,
    canManageBusinessConfig: false,
    canViewFinancials: true,
    canManagePricing: false,
  },
  'business-admin': {
    canManageProducts: true,
    canManageOrders: true,
    canManageInventory: true,
    canManageUsers: true,
    canManageSystemConfig: false,
    canManageBusinessConfig: true,
    canViewFinancials: true,
    canManagePricing: true,
  },
  'system-admin': {
    canManageProducts: true,
    canManageOrders: true,
    canManageInventory: true,
    canManageUsers: true,
    canManageSystemConfig: true,
    canManageBusinessConfig: true,
    canViewFinancials: true,
    canManagePricing: true,
  },
};

// Roles visible in the public navigation (excludes internal-only roles)
export const publicRoles: UserRole[] = ['buyer', 'seller', 'agent'];

// Roles that are internal only — not shown in public nav
export const internalRoles: UserRole[] = ['operator', 'business-admin', 'system-admin'];

export interface RoleRating {
  score: number;       // 0.0 – 5.0
  reviewCount: number;
  assignedBy: 'system' | 'operator';
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  activeRoles: UserRole[];   // replaces single `role` — a user can have multiple
  linkedWebsites: string[];
  company?: string;
  ratings: {
    buyer?: RoleRating;
    seller?: RoleRating;
    agent?: RoleRating;
  };
}
