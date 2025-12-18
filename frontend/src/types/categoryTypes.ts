export interface Category {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  avgTrustScore?: number;
  providerCount?: number;
}
