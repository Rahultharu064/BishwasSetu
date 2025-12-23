import axiosapi from "./api";

export const getAdminProviders = async () => {
    const res = await axiosapi.get("/admin/providers");
    return res.data;
};
