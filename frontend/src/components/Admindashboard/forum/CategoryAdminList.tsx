import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllCategories, deleteCategory } from "../../../services/categoryService";
import type { Category } from "../../../types/categoryTypes";
import { Plus, Search, Pencil, Trash2, SlidersHorizontal, Package } from "lucide-react";
import Button from "../../ui/Button";
import Card from "../../ui/Card";

const CategoryAdminList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id);
        setCategories(categories.filter(cat => cat.id !== id));
      } catch (error) {
        console.error("Failed to delete category", error);
      }
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Categories</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and organize service categories for the platform
          </p>
        </div>
        <Link to="/admin/category/create">
          <Button className="flex items-center gap-2 px-6 bg-blue-600 hover:bg-blue-700">
            <Plus size={20} />
            <span>Create New Category</span>
          </Button>
        </Link>
      </div>

      {/* Filters & Actions */}
      <Card className="p-4 border-0 shadow-sm ring-1 ring-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm"
            />
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <SlidersHorizontal size={16} />
            <span>Showing {filteredCategories.length} categories</span>
          </div>
        </div>
      </Card>

      {/* Categories Table */}
      <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Trust Score</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Provider Count</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCategories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold border border-blue-100 shrink-0 overflow-hidden">
                        {(() => {
                          if (!category.icon) return category.name.charAt(0);
                          let icon = category.icon.trim();
                          if (icon.startsWith('<svg') || icon.includes('<path')) {
                            return (
                              <div
                                className="w-6 h-6 [&>svg]:w-6 [&>svg]:h-6"
                                dangerouslySetInnerHTML={{ __html: icon }}
                              />
                            );
                          }
                          return <img src={icon} alt="" className="w-full h-full object-cover" />;
                        })()}
                      </div>
                      <span className="font-bold text-gray-900">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-500 max-w-sm line-clamp-1">
                      {category.description || 'No description provided'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
                      {category.avgTrustScore ? category.avgTrustScore.toFixed(1) : '0.0'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                      <Package size={14} className="text-gray-400" />
                      {category.providerCount || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/category/update/${category.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit category"
                      >
                        <Pencil size={18} />
                      </Link>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete category"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={40} className="text-gray-200" />
                      <p className="font-medium">No categories found matching your search</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default CategoryAdminList;
