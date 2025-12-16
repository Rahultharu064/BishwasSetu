import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { updateCategory, getAllCategories } from "../../../services/categoryService";
import toast from "react-hot-toast";
import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import type { Category } from "../../../types/categoryTypes";

const CategoryUpdate = () => {
  const { id } = useParams<{ id: string }>();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    setIsVisible(true);
    if (id) {
      loadCategory();
    }
  }, [id]);

  const loadCategory = async () => {
    try {
      const categories = await getAllCategories();
      const foundCategory = categories.find((cat) => cat.id === id);
      if (foundCategory) {
        setCategory(foundCategory);
        setName(foundCategory.name);
        setIcon(foundCategory.icon || "");
      }
    } catch (error) {
      toast.error("Failed to load category");
    }
  };

  if (!id) {
    return <div>Invalid category ID</div>;
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setLoading(true);

      await updateCategory(id, { name, icon });

      toast.success("Category updated successfully 🎉");
    } catch (error: any) {
      if (error?.response?.status === 400) {
        toast.error("Category name already exists");
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      <Card className={`max-w-md w-full transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 animate-pulse">Update Category</h2>
          <p className="text-gray-600">Modify the category details</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
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

          <div className="animate-fade-in-up animation-delay-600">
            <Button type="submit" loading={loading} className="w-full">
              {loading ? "Updating Category..." : "Update Category"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CategoryUpdate;
