import api from './api';
import type { Service, CreateServiceData, UpdateServiceData, ServiceFilters } from '../types/serviceTypes';

export const createService = async (data: CreateServiceData): Promise<Service> => {
  const response = await api.post('/services', data);
  return response.data.data;
};

export const getAllServices = async (filters?: ServiceFilters): Promise<Service[]> => {
  const params = new URLSearchParams();
  if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
  if (filters?.location) params.append('location', filters.location);
  if (filters?.search) params.append('search', filters.search);

  const response = await api.get(`/services?${params.toString()}`);
  return response.data.data;
};

export const getServiceById = async (id: string): Promise<Service> => {
  const response = await api.get(`/services/${id}`);
  return response.data.data;
};

export const updateService = async (id: string, data: UpdateServiceData): Promise<Service> => {
  const response = await api.put(`/services/${id}`, data);
  return response.data.data;
};

export const deleteService = async (id: string): Promise<void> => {
  await api.delete(`/services/${id}`);
};

export const getMyServices = async (): Promise<Service[]> => {
  const response = await api.get('/services/provider/me');
  return response.data.data;
};
