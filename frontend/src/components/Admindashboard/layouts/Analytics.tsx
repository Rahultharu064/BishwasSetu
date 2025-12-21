import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, BarChart3 } from 'lucide-react';

interface Metric {
    title: string;
    value: string;
    change: number;
    changeType: 'increase' | 'decrease';
    icon: React.ComponentType<any>;
}

interface ChartData {
    month: string;
    users: number;
    providers: number;
    bookings: number;
    revenue: number;
}

const Analytics = () => {
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock data - replace with API calls
        const mockMetrics: Metric[] = [
            {
                title: 'Total Revenue',
                value: '₹2,45,000',
                change: 12.5,
                changeType: 'increase',
                icon: DollarSign
            },
            {
                title: 'New Users',
                value: '1,234',
                change: 8.2,
                changeType: 'increase',
                icon: Users
            },
            {
                title: 'Total Bookings',
                value: '3,456',
                change: -2.1,
                changeType: 'decrease',
                icon: Calendar
            },
            {
                title: 'Active Providers',
                value: '567',
                change: 15.3,
                changeType: 'increase',
                icon: BarChart3
            }
        ];

        const mockChartData: ChartData[] = [
            { month: 'Jan', users: 1200, providers: 450, bookings: 3200, revenue: 180000 },
            { month: 'Feb', users: 1350, providers: 480, bookings: 3500, revenue: 195000 },
            { month: 'Mar', users: 1500, providers: 520, bookings: 3800, revenue: 210000 },
            { month: 'Apr', users: 1650, providers: 550, bookings: 4100, revenue: 225000 },
            { month: 'May', users: 1800, providers: 580, bookings: 4400, revenue: 240000 },
            { month: 'Jun', users: 1950, providers: 600, bookings: 4700, revenue: 255000 }
        ];

        setMetrics(mockMetrics);
        setChartData(mockChartData);
        setLoading(false);
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-64">Loading analytics...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
                <p className="text-gray-600 mt-1">Comprehensive insights into platform performance</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                                    <div className={`flex items-center mt-2 text-sm ${
                                        metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {metric.changeType === 'increase' ? (
                                            <TrendingUp size={16} className="mr-1" />
                                        ) : (
                                            <TrendingDown size={16} className="mr-1" />
                                        )}
                                        <span className="font-medium">
                                            {metric.changeType === 'increase' ? '+' : ''}{metric.change}%
                                        </span>
                                        <span className="text-gray-500 ml-1">vs last month</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <Icon className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Growth Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Growth</h2>
                    <div className="h-64 flex items-end justify-between space-x-2">
                        {chartData.map((data, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center">
                                <div className="w-full bg-gray-200 rounded-t h-32 relative">
                                    <div
                                        className="bg-blue-500 rounded-t absolute bottom-0 w-full"
                                        style={{ height: `${(data.users / 2000) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs text-gray-500 mt-2">{data.month}</span>
                                <span className="text-xs font-medium text-gray-700">{data.users}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex items-center justify-center">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            <span className="text-sm text-gray-600">New Users</span>
                        </div>
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h2>
                    <div className="h-64 flex items-end justify-between space-x-2">
                        {chartData.map((data, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center">
                                <div className="w-full bg-gray-200 rounded-t h-32 relative">
                                    <div
                                        className="bg-green-500 rounded-t absolute bottom-0 w-full"
                                        style={{ height: `${(data.revenue / 300000) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs text-gray-500 mt-2">{data.month}</span>
                                <span className="text-xs font-medium text-gray-700">₹{(data.revenue / 1000).toFixed(0)}k</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex items-center justify-center">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span className="text-sm text-gray-600">Revenue</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Stats Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Monthly Breakdown</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Month
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    New Users
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    New Providers
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Bookings
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Revenue
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {chartData.map((data, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {data.month} 2024
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {data.users.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {data.providers}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {data.bookings.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ₹{data.revenue.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
