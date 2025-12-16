import { useState, useEffect } from "react";
import { createCategory } from "../../../services/categoryService";
import toast from "react-hot-toast";
import Card from "../../ui/Card";
import Input from "../../ui/Input";
import Button from "../../ui/Button";

const CategoryCreate = () => {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setLoading(true);

      await createCategory({ name, icon });

      toast.success("Category created successfully 🎉");
      setName("");
      setIcon("");
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      <Card className={`max-w-md w-full transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 animate-pulse">Create Category</h2>
          <p className="text-gray-600">Add a new category to your forum</p>
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
              Icon (Optional)
            </label>
            <Input
              placeholder="e.g., 📁, 🎯, 💡"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="animate-fade-in-up animation-delay-600">
            <Button type="submit" loading={loading} className="w-full">
              {loading ? "Creating Category..." : "Create Category"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CategoryCreate;
