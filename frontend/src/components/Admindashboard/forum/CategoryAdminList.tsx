import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllCategories, deleteCategory } from "../../../services/categoryService";
import type { Category } from "../../../types/categoryTypes";

const CategoryAdminList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div>Loading categories...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Categories</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">Name</th>
            <th className="border border-gray-300 p-2">Icon</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td className="border border-gray-300 p-2">{category.name}</td>
              <td className="border border-gray-300 p-2">
                {category.icon ? (
                  category.icon.trim().startsWith('<svg') && category.icon.trim().endsWith('</svg>') ? (
                    <div
                      className="w-8 h-8 flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: category.icon }}
                    />
                  ) : (
                    <img src={category.icon} alt={category.name} className="w-8 h-8" />
                  )
                ) : (
                  <span>{category.name.charAt(0).toUpperCase()}</span>
                )}
              </td>
              <td className="border border-gray-300 p-2">
                <Link
                  to={`/update/${category.id}`}
                  className="text-blue-500 hover:underline mr-2"
                >
                  Update
                </Link>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoryAdminList;
