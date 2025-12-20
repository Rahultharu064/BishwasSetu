import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../../../Redux/store';
import {
    ShieldCheck,
    Calendar,
    Wallet,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Clock,
    ChevronRight,
    Briefcase,
    Star
} from 'lucide-react';

const DashboardOverview: React.FC = () => {
    const { profile } = useSelector((state: RootState) => state.auth);

    // Mock Data - In real app, fetch from API
    const stats = [
        {
            label: 'Total Bookings',
            value: '24',
            change: '+12%',
            trend: 'up',
            icon: Calendar,
            bg: 'bg-blue-50',
            color: 'text-blue-600'
        },
        {
            label: 'Total Earnings',
            value: 'Rs. 45,200',
            change: '+8.5%',
            trend: 'up',
            icon: Wallet,
            bg: 'bg-green-50',
            color: 'text-green-600'
        },
        {
            label: 'Trust Score',
            value: '4.8',
            change: '+0.2',
            trend: 'up',
            icon: ShieldCheck,
            bg: 'bg-indigo-50',
            color: 'text-indigo-600'
        },
        {
            label: 'Active Jobs',
            value: '3',
            change: 'Normal',
            trend: 'neutral',
            icon: Briefcase,
            bg: 'bg-amber-50',
            color: 'text-amber-600'
        },
    ];

    const recentBookings = [
        { id: 1, customer: 'Ram Sharma', service: 'Plumbing Repair', date: 'Today, 2:00 PM', status: 'Pending', amount: 'Rs. 800' },
        { id: 2, customer: 'Sita Nepali', service: 'Full House Cleaning', date: 'Tomorrow, 10:00 AM', status: 'Confirmed', amount: 'Rs. 2,500' },
        { id: 3, customer: 'Hari Krishna', service: 'Electric Wiring', date: '22 Dec, 4:00 PM', status: 'Completed', amount: 'Rs. 1,200' },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* 1. Header Section */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
                <p className="text-gray-500 mt-1 text-sm">Welcome back, here's what's happening today.</p>
            </div>

            {/* 2. Verification Banner (Conditional) */}
            {!profile?.isVerified && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                    <div className="flex gap-4">
                        <div className="p-3 bg-amber-100 text-amber-600 rounded-lg flex-shrink-0">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-gray-900">Verification Pending</h3>
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                Your profile is under review. Complete your KYC documents to start accepting bookings and boost your Trust Score.
                            </p>
                        </div>
                    </div>
                    <Link
                        to="/provider/kyc"
                        className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap shadow-md hover:shadow-lg"
                    >
                        Complete KYC Now
                    </Link>
                </div>
            )}

            {/* 3. Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <Icon size={22} />
                                </div>
                                {stat.trend === 'up' && (
                                    <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                        <TrendingUp size={12} /> {stat.change}
                                    </div>
                                )}
                            </div>
                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-500">{stat.label}</h4>
                                <h2 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h2>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 4. Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Recent Requests */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">Recent Booking Requests</h3>
                            <Link to="/provider/bookings" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                View All <ChevronRight size={16} />
                            </Link>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {recentBookings.map((booking) => (
                                <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm">
                                            {booking.customer.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 text-sm">{booking.service}</h4>
                                            <p className="text-xs text-gray-500 mt-0.5">By {booking.customer} &bull; {booking.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-semibold text-gray-900 text-sm">{booking.amount}</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium 
                                            ${booking.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
                                                booking.status === 'Confirmed' ? 'bg-blue-50 text-blue-700' :
                                                    'bg-green-50 text-green-700'}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Trust Score Details */}
                <div className="space-y-6">
                    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
                        <h3 className="font-bold text-gray-900 mb-6">Trust Score Analysis</h3>

                        <div className="flex flex-col items-center justify-center py-6 relative">
                            {/* Circular Meter Simulation */}
                            <div className="w-32 h-32 rounded-full border-8 border-gray-100 flex items-center justify-center relative">
                                <div className="absolute inset-0 border-8 border-indigo-600 rounded-full border-t-transparent -rotate-45" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0% 50%)' }}></div>
                                <div className="text-center">
                                    <span className="text-3xl font-bold text-gray-900">92</span>
                                    <span className="block text-xs text-gray-500 uppercase tracking-wide">Excellent</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 mt-6">
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <CheckCircle2 size={16} className="text-green-500" /> Identity Verified
                                </div>
                                <span className="font-semibold text-gray-900">20 pts</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Star size={16} className="text-amber-500" /> 5-Star Reviews
                                </div>
                                <span className="font-semibold text-gray-900">45 pts</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Clock size={16} className="text-blue-500" /> Response Time
                                </div>
                                <span className="font-semibold text-gray-900">27 pts</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-50">
                            <p className="text-xs text-gray-400 text-center leading-relaxed">
                                Improving your response time and getting more reviews will increase your score.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
