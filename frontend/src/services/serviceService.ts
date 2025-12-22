import axiosapi from "./api";
import type { Service, CreateServiceData, UpdateServiceData } from "../types/serviceTypes";

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

// Get service statistics (aggregated by title)
export const getServiceStats = async () => {
    const res = await axiosapi.get("/services/stats");
    return res.data;
};

