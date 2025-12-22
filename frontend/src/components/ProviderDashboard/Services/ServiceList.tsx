import React, { useState, useEffect } from 'react';
import ServiceForm from '../forum/ServiceForm';
import { getServicesByProvider, deleteService } from '../../../services/serviceService';

interface Service {
    id: number;
    title: string;
    description: string;
    icon?: string;
    category: {
        name: string;
    };
    provider: {
        price: number;
        duration: string;
        availability: string;
    };
}

const ServiceList: React.FC = () => {
    const [isAddingRequest, setIsAddingRequest] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAddingRequest) {
            fetchServices();
        }
    }, [isAddingRequest]);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await getServicesByProvider();
            setServices(response);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch services');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this service?')) return;

        try {
            await deleteService(id);
            setServices(services.filter(service => service.id !== id));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete service');
        }
    };

    if (isAddingRequest) {
        return (
            <div>
                <button
                    onClick={() => setIsAddingRequest(false)}
                    className="mb-4 text-blue-600 hover:text-blue-700 flex items-center font-medium"
                >
                    &larr; Back to Services
                </button>
                <ServiceForm />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">My Services</h1>
                <button
                    onClick={() => setIsAddingRequest(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <span>+</span> Add New Service
                </button>
            </div>

            {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg">{error}</div>}

            {loading ? (
                <div className="text-center py-8">Loading services...</div>
            ) : services.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🛠️</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No services listed yet</h3>
                    <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                        Start earning by adding your first service. Describe what you offer, set your price, and get discovered.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                        <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">{service.title}</h3>
                                    <p className="text-sm text-gray-500">{service.category.name}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(service.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    🗑️
                                </button>
                            </div>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{service.description}</p>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Price:</span>
                                    <span className="font-medium">Rs. {service.provider.price}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Duration:</span>
                                    <span className="font-medium">{service.provider.duration}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-500">Availability:</span>
                                    <span className="font-medium">{service.provider.availability}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ServiceList;
