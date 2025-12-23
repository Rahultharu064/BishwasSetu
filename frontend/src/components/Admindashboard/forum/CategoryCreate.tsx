import { useState } from "react";
import { createCategory } from "../../../services/categoryService";
import toast from "react-hot-toast";
import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Button from "../../ui/Button";

import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const CategoryCreate = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setLoading(true);

      await createCategory({ name, icon, description });

      toast.success("Category created successfully 🎉");
      navigate("/admin/categories");
    } catch (error: any) {
      if (error?.response?.status === 400) {
        toast.error("Category already exists");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate("/admin/categories")}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors font-medium text-sm group"
      >
        <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
        Back to Categories
      </button>

      <Card className="p-8 border-0 shadow-sm ring-1 ring-gray-100">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Create Category</h2>
          <p className="text-sm text-gray-500 mt-1">Add a new service category to the platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="animate-fade-in-up animation-delay-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name *
            </label>
            <Input
              placeholder="Enter category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="animate-fade-in-up animation-delay-400">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon URL/Path (Optional)
            </label>
            <Input
              placeholder="e.g., <svg>...</svg> or https://example.com/icon.svg"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="animate-fade-in-up animation-delay-500">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              placeholder="Enter category description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
              maxLength={1000}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="pt-4">
            <Button type="submit" loading={loading} className="w-full bg-blue-600 hover:bg-blue-700 h-11">
              {loading ? "Creating Category..." : "Create Category"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CategoryCreate;
