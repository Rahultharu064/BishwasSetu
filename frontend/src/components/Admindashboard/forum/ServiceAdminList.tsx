import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllServices, deleteService } from "../../../services/serviceService";
import { Search, Trash2, SlidersHorizontal, Package, User, Tag, Plus } from "lucide-react";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import toast from "react-hot-toast";

const ServiceAdminList = () => {
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const data = await getAllServices();
            setServices(data);
        } catch (error) {
            console.error("Failed to fetch services", error);
            toast.error("Failed to load services");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this service?")) {
            try {
                await deleteService(id);
                setServices(services.filter(service => service.id !== id));
                toast.success("Service deleted successfully");
            } catch (error) {
                console.error("Failed to delete service", error);
                toast.error("Failed to delete service");
            }
        }
    };

    const filteredServices = services.filter(service =>
        service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (service.category?.name && service.category.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (service.provider?.user?.name && service.provider.user.name.toLowerCase().includes(searchQuery.toLowerCase()))
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
                    <h1 className="text-2xl font-bold text-gray-900">Manage Services</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Monitor and manage all services provided on the platform
                    </p>
                </div>
                <Link to="/admin/service/create">
                    <Button className="flex items-center gap-2 px-6 bg-blue-600 hover:bg-blue-700">
                        <Plus size={20} />
                        <span>Create New Service</span>
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
                            placeholder="Search by service, category or provider..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                        <SlidersHorizontal size={16} />
                        <span>Showing {filteredServices.length} services</span>
                    </div>
                </div>
            </Card>

            {/* Services Table */}
            <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Service</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Provider</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Price</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredServices.map((service) => (
                                <tr key={service.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold border border-blue-100 shrink-0">
                                                {service.icon || <Package size={20} />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{service.title}</div>
                                                <div className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">{service.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                            <User size={14} className="text-gray-400" />
                                            {service.provider?.user?.name || 'Unknown'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
                                            <Tag size={12} />
                                            {service.category?.name || 'Uncategorized'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="text-sm font-bold text-gray-900">
                                            Rs. {service.provider?.price || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleDelete(service.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete service"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredServices.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Search size={40} className="text-gray-200" />
                                            <p className="font-medium">No services found matching your search</p>
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

export default ServiceAdminList;
