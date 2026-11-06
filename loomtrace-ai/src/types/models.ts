import type { Timestamp } from "firebase/firestore";

export type UserRole = "weaver" | "buyer" | "government" | "admin";

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: "active" | "suspended";
  emailVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type ProductStatus = "draft" | "published" | "archived";

export interface Product {
  id: string;
  weaverId: string;
  clusterId: string;
  title: string;
  category: string;
  materials: string[];
  priceRange: { min: number; max: number };
  images: string[];
  videoUrl?: string;
  status: ProductStatus;
  aiGenerated?: {
    description: string;
    tags: string[];
    suggestedPrice: { min: number; max: number };
  };
  dpiId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type VerificationStatus = "unverified" | "pending" | "verified" | "flagged";

export interface WeaverIdentity {
  weaverId: string;
  userId: string;
  clusterId: string;
  verificationStatus: VerificationStatus;
  skills: string[];
  craftSpecializations: string[];
  experienceYears: number;
  reputationScore: number;
  cooperativeMemberships: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Order {
  id: string;
  buyerId: string;
  weaverId: string;
  productId: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  amount: number;
  createdAt: Timestamp;
}

export interface WishlistItem {
  id: string;
  buyerId: string;
  productId: string;
  createdAt: Timestamp;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: Timestamp;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown>;
  timestamp: Timestamp;
}
