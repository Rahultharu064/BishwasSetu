import axiosapi from "./api";

// Types based on the backend Service model
export interface Service {
    id: number;
    providerId: number;
    categoryId: string;
    title: string;
    description: string;
    price: number;
    duration: string;
    availability: string;
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
    price: number;
    duration: string;
    availability: string;
}

export interface UpdateServiceData {
    categoryId?: string;
    title?: string;
    description?: string;
    price?: number;
    duration?: string;
    availability?: string;
}

// Create a new service (Provider only)
export const createService = (data: CreateServiceData) =>
    axiosapi.post("/services", data);

// Get all services by the current provider (Provider only)
export const getServicesByProvider = async () => {
    const res = await axiosapi.get("/services/provider");
    return res.data;
};

// Update a service (Provider only)
export const updateService = (id: number, data: UpdateServiceData) =>
    axiosapi.put(`/services/${id}`, data);

// Delete a service (Provider only)
export const deleteService = (id: number) =>
    axiosapi.delete(`/services/${id}`);

// Get all services by category (Public)
export const getServicesByCategory = async (categoryId: string) => {
    const res = await axiosapi.get(`/services/category/${categoryId}`);
    return res.data;
};

// Get all services (Public)
export const getAllServices = async () => {
    const res = await axiosapi.get("/services");
    return res.data;
};
