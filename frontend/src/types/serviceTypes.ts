export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  providerId: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  provider?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  category?: {
    id: string;
    name: string;
    icon?: string;
  };
}

export interface CreateServiceData {
  title: string;
  description: string;
  price: number;
  location: string;
  categoryId: string;
}

export interface UpdateServiceData {
  title?: string;
  description?: string;
  price?: number;
  location?: string;
  categoryId?: string;
}

export interface ServiceFilters {
  category?: string;
  location?: string;
  search?: string;
}
