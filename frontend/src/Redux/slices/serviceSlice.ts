import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
  getMyServices,
} from '../../services/serviceService';
import type { Service, CreateServiceData, UpdateServiceData, ServiceFilters } from '../../types/serviceTypes';

interface ServiceState {
  services: Service[];
  myServices: Service[];
  currentService: Service | null;
  loading: boolean;
  error: string | null;
}

const initialState: ServiceState = {
  services: [],
  myServices: [],
  currentService: null,
  loading: false,
  error: null,
};

export const fetchServices = createAsyncThunk(
  'services/fetchAll',
  async (filters: ServiceFilters | undefined, { rejectWithValue }) => {
    try {
      return await getAllServices(filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch services');
    }
  }
);

export const fetchServiceById = createAsyncThunk(
  'services/fetchOne',
  async (id: string, { rejectWithValue }) => {
    try {
      return await getServiceById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch service');
    }
  }
);

export const fetchMyServices = createAsyncThunk(
  'services/fetchMyServices',
  async (_, { rejectWithValue }) => {
    try {
      return await getMyServices();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch my services');
    }
  }
);

export const createNewService = createAsyncThunk(
  'services/create',
  async (data: CreateServiceData, { rejectWithValue }) => {
    try {
      return await createService(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create service');
    }
  }
);

export const updateExistingService = createAsyncThunk(
  'services/update',
  async ({ id, data }: { id: string; data: UpdateServiceData }, { rejectWithValue }) => {
    try {
      return await updateService(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update service');
    }
  }
);

export const removeService = createAsyncThunk(
  'services/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteService(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete service');
    }
  }
);

const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    clearCurrentService: (state) => {
      state.currentService = null;
    },
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch All Services
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action: PayloadAction<Service[]>) => {
        state.loading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Single Service
    builder
      .addCase(fetchServiceById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServiceById.fulfilled, (state, action: PayloadAction<Service>) => {
        state.loading = false;
        state.currentService = action.payload;
      })
      .addCase(fetchServiceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch My Services
    builder
      .addCase(fetchMyServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyServices.fulfilled, (state, action: PayloadAction<Service[]>) => {
        state.loading = false;
        state.myServices = action.payload;
      })
      .addCase(fetchMyServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Service
    builder
      .addCase(createNewService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewService.fulfilled, (state, action: PayloadAction<Service>) => {
        state.loading = false;
        state.myServices.push(action.payload);
        // Optionally add to general services list if appropriate
        state.services.push(action.payload);
      })
      .addCase(createNewService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Service
    builder
      .addCase(updateExistingService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateExistingService.fulfilled, (state, action: PayloadAction<Service>) => {
        state.loading = false;
        // Update in myServices
        const index = state.myServices.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.myServices[index] = action.payload;
        }
        // Update in services
        const serviceIndex = state.services.findIndex((s) => s.id === action.payload.id);
        if (serviceIndex !== -1) {
          state.services[serviceIndex] = action.payload;
        }
        state.currentService = action.payload;
      })
      .addCase(updateExistingService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Service
    builder
      .addCase(removeService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeService.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.myServices = state.myServices.filter((s) => s.id !== action.payload);
        state.services = state.services.filter((s) => s.id !== action.payload);
        if (state.currentService?.id === action.payload) {
          state.currentService = null;
        }
      })
      .addCase(removeService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentService, clearErrors } = serviceSlice.actions;
export default serviceSlice.reducer;
