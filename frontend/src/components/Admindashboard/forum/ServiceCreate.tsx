import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createService } from '../../../services/serviceService';
import { getAllCategories } from '../../../services/categoryService';
import Select from '../../ui/Select';
import { toast } from 'react-hot-toast';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { ArrowLeft, Package, Tag, Type, Info } from 'lucide-react';

const AdminServiceCreate = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        categoryId: '',
        title: '',
        description: '',
        icon: ''
    });
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const cats = await getAllCategories();
                setCategories(cats);
            } catch (err) {
                toast.error('Failed to load categories');
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createService({
                categoryId: formData.categoryId,
                title: formData.title,
                description: formData.description,
                icon: formData.icon || undefined
            });

            toast.success('Service created successfully!');
            navigate('/admin/services');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create service');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <button
                onClick={() => navigate("/admin/services")}
                className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors font-medium text-sm group"
            >
                <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                Back to Services
            </button>

            <Card className="p-8 border-0 shadow-sm ring-1 ring-gray-100">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Create New Service</h2>
                    <p className="text-sm text-gray-500 mt-1">Add a new service to the platform</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Category Selection */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <Tag size={16} className="text-blue-500" />
                            Service Category
                        </label>
                        <Select
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleChange}
                            className="w-full h-11"
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </Select>
                    </div>

                    {/* Service Title */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <Type size={16} className="text-blue-500" />
                            Service Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium h-11"
                            placeholder="e.g. Premium House Cleaning"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <Info size={16} className="text-blue-500" />
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium resize-none"
                            placeholder="Detailed description of the service..."
                            required
                        />
                    </div>

                    {/* Icon */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <Package size={16} className="text-blue-500" />
                            Icon (Emoji or SVG)
                        </label>
                        <input
                            type="text"
                            name="icon"
                            value={formData.icon}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium h-11"
                            placeholder="e.g. 🧹 or <svg>...</svg>"
                        />
                    </div>

                    <div className="pt-4">
                        <Button type="submit" loading={loading} className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all">
                            {loading ? "Creating Service..." : "Create Service"}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default AdminServiceCreate;
