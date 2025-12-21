
import axiosapi from "./api";

export const becomeProvider = (data: any) =>
  axiosapi.post("/providers/become", data);

export const completeProfile = (data: any) =>
        axiosapi.put("/providers/profile", data);

export const uploadProfilePhoto = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return axiosapi.post("/providers/profile-photo", formData);
};

export const uploadKyc = (type: string, file: File) => {
  const formData = new FormData();
  formData.append("type", type);
  formData.append("file", file);
  return axiosapi.post("/providers/kyc", formData);
};

export const getKycStatus = () =>
  axiosapi.get("/providers/kyc/status");

export const getProviderById = (id: number) =>
  axiosapi.get(`/providers/${id}`);
