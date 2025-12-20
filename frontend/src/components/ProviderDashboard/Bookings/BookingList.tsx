import React, { useState } from 'react';

const BookingList: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'completed' | 'cancelled'>('pending');

    const tabs = [
        { id: 'pending', label: 'Pending Requests' },
        { id: 'active', label: 'Active Jobs' },
        { id: 'completed', label: 'Completed' },
        { id: 'cancelled', label: 'Cancelled' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Booking Management</h1>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-1">
                <div className="flex space-x-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">📅</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No {activeTab} bookings</h3>
                <p className="text-gray-500 mt-2">
                    {activeTab === 'pending'
                        ? 'New booking requests from customers will appear here.'
                        : `You have no ${activeTab} bookings at the moment.`}
                </p>
            </div>
        </div>
    );
};

export default BookingList;
