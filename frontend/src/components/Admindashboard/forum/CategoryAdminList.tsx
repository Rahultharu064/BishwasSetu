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
            <th className="border border-gray-300 p-2">Description</th>
            <th className="border border-gray-300 p-2">Icon</th>
            <th className="border border-gray-300 p-2">Trust Score</th>
            <th className="border border-gray-300 p-2">Providers</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td className="border border-gray-300 p-2">{category.name}</td>
              <td className="border border-gray-300 p-2">
                <div className="max-w-xs truncate">
                  {category.description || '-'}
                </div>
              </td>
              <td className="border border-gray-300 p-2">
                {(() => {
                  if (!category.icon) {
                    return (
                      <span className="font-bold text-gray-500 bg-gray-200 w-8 h-8 flex items-center justify-center rounded">
                        {category.name.charAt(0).toUpperCase()}
                      </span>
                    );
                  }

                  let cleanIcon = category.icon.trim();

                  // Helper to decode HTML entities inline since we can't easily add a top-level function inside the map without extracting it
                  if (cleanIcon.includes('&lt;') || cleanIcon.includes('&gt;')) {
                    const txt = document.createElement("textarea");
                    txt.innerHTML = cleanIcon;
                    cleanIcon = txt.value;
                  }

                  const lowerIcon = cleanIcon.toLowerCase();

                  if (lowerIcon.startsWith('<svg') || lowerIcon.includes('<path') || lowerIcon.includes('<g')) {
                    let svgContent = cleanIcon;
                    if (!lowerIcon.startsWith('<svg')) {
                      svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">${cleanIcon}</svg>`;
                    } else {
                      svgContent = cleanIcon.replace(/<svg/i, '<svg class="w-6 h-6"');
                    }

                    return (
                      <div
                        className="w-8 h-8 flex items-center justify-center [&>svg]:w-6 [&>svg]:h-6"
                        dangerouslySetInnerHTML={{ __html: svgContent }}
                      />
                    );
                  } else {
                    return <img src={cleanIcon} alt={category.name} className="w-8 h-8 object-cover rounded" />;
                  }
                })()}
              </td>
              <td className="border border-gray-300 p-2">
                {category.avgTrustScore ? category.avgTrustScore.toFixed(1) : '-'}
              </td>
              <td className="border border-gray-300 p-2">
                {category.providerCount || 0}
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
