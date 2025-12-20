import React, { useState } from 'react';
import ServiceForm from '../forum/ServiceForm';

const ServiceList: React.FC = () => {
    const [isAddingRequest, setIsAddingRequest] = useState(false);
    const [services] = useState<any[]>([]); // Placeholder for fetched services

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

            {services.length === 0 ? (
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
                    {/* Render service cards service */}
                </div>
            )}
        </div>
    );
};

export default ServiceList;
