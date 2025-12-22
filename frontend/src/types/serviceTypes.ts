export interface Service {
    id: number;
    providerId: number;
    categoryId: string;
    title: string;
    description: string;
    icon?: string;
    createdAt: string;
    updatedAt: string;
    category?: {
        id: string;
        name: string;
        icon?: string;
        description?: string;
    };
    provider?: {
        id: number;
        userId: number;
        legalName: string;
        experienceYears: number;
        bio: string;
        serviceArea: string;
        availability: string;
        profilePhotoUrl?: string;
        verificationStatus: string;
        trustScore: number;
        user?: {
            name: string;
        };
        kycDocuments?: Array<{
            id: number;
            type: string;
            fileUrl: string;
            status: string;
        }>;
    };
}

export interface CreateServiceData {
    categoryId: string;
    title: string;
    description: string;
    icon?: string;
}

export interface UpdateServiceData {
    categoryId?: string;
    title?: string;
    description?: string;
    icon?: string;
}

export interface ServiceStats {
    id: number;
    name: string;
    icon?: string;
    providers: number;
    rating: number;
    category: string;
}
