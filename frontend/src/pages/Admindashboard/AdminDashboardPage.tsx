import  { useEffect, useState } from 'react';
import { Users, UserCheck, FileText, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

const AdminDashboardPage = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalProviders: 0,
        pendingVerifications: 0,
        totalComplaints: 0,
        platformRevenue: 0,
        activeBookings: 0
    });

    useEffect(() => {
        // Fetch dashboard stats from API
        // For now, using mock data
        setStats({
            totalUsers: 1250,
            totalProviders: 340,
            pendingVerifications: 15,
            totalComplaints: 8,
            platformRevenue: 45000,
            activeBookings: 67
        });
    }, []);

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            title: 'Verified Providers',
            value: stats.totalProviders,
            icon: UserCheck,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            title: 'Pending Verifications',
            value: stats.pendingVerifications,
            icon: AlertTriangle,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50'
        },
        {
            title: 'Active Complaints',
            value: stats.totalComplaints,
            icon: FileText,
            color: 'text-red-600',
            bgColor: 'bg-red-50'
        },
        {
            title: 'Platform Revenue',
            value: `₹${stats.platformRevenue.toLocaleString()}`,
            icon: TrendingUp,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        },
        {
            title: 'Active Bookings',
            value: stats.activeBookings,
            icon: BarChart3,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50'
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Overview of platform metrics and management</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                </div>
                                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                    <Icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">New provider verification request</p>
                            <p className="text-xs text-gray-500">John Doe submitted KYC documents</p>
                        </div>
                        <span className="text-xs text-gray-400">2 hours ago</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Complaint filed</p>
                            <p className="text-xs text-gray-500">Service quality issue reported</p>
                        </div>
                        <span className="text-xs text-gray-400">4 hours ago</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">New user registration</p>
                            <p className="text-xs text-gray-500">Sarah Wilson joined the platform</p>
                        </div>
                        <span className="text-xs text-gray-400">6 hours ago</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
