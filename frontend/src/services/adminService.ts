import axiosapi from "./api";

export const getAdminProviders = async () => {
    const res = await axiosapi.get("/admin/providers");
    return res.data;
};

export const getPendingProviders = async () => {
    const res = await axiosapi.get("/admin/providers/pending");
    return res.data;
};

export const getProvidersByStatus = async (status: string) => {
    const res = await axiosapi.get(`/admin/providers/status?status=${status}`);
    return res.data;
};

export const acceptProvider = async (providerId: number) => {
    const res = await axiosapi.put(`/admin/providers/${providerId}/accept`);
    return res.data;
};

export const rejectProvider = async (providerId: number, reason?: string) => {
    const res = await axiosapi.put(`/admin/providers/${providerId}/reject`, { reason });
    return res.data;
};
