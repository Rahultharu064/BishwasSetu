import axiosapi from "./api";
import type{ Category } from "../types/categoryTypes";

export const createCategory = async(data:{
    name:string;
    icon?:string;

})=>{
    const response= await axiosapi.post("/categories/create",data)
    return response.data
}


// Get all categories (Public)
export const getAllCategories = async (): Promise<Category[]> => {
  const response = await axiosapi.get("/categories");
  return response.data;
};


export const searchCategory = async (query: string) => {
  const response = await axiosapi.get(
    `/categories/search?query=${query}`
  );
  return response.data;
};

// Update category (Admin)
export const updateCategory = async (
  id: string,
  data: Partial<Category>
) => {
  const response = await axiosapi.put(`/categories/${id}`, data);
  return response.data;
};

// Delete category (Admin)
export const deleteCategory = async (id: string) => {
  const response = await axiosapi.delete(`/categories/${id}`);
  return response.data;
};