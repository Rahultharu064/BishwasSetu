import React, { useState, useEffect } from 'react';
import { createService } from '../../../services/serviceService';
import { getAllCategories } from '../../../services/categoryService';
import Select from '../../ui/Select';
import { toast } from 'react-hot-toast';

interface Category {
    id: string;
    name: string;
}

const ServiceForm: React.FC = () => {
    const [formData, setFormData] = useState({
        categoryId: '',
        title: '',
        description: '',
        icon: ''
    });
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await getAllCategories();
            setCategories(response);
        } catch (err: any) {
            setError('Failed to load categories');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await createService({
                categoryId: formData.categoryId,
                title: formData.title,
                description: formData.description,
                icon: formData.icon || undefined
            });

            toast.success('Service created successfully!');

            // Reset form
            setFormData({
                categoryId: '',
                title: '',
                description: '',
                icon: ''
            });
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to create service';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Add New Service</h2>

            {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <Select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                    >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </Select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. House Cleaning"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Describe what you offer..."
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon (Optional)</label>
                    <input
                        type="text"
                        name="icon"
                        value={formData.icon}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. 🧹 or 🔧"
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Service'}
                    </button>
                </div>
            </form >
        </div >
    );
};

export default ServiceForm;
