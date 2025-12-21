import React from 'react';
import { MapPin, Star, Calendar, TrendingUp } from 'lucide-react';

const CustomerDashboard: React.FC = () => {
  const stats = [
    {
      title: 'Active Bookings',
      value: '3',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Completed Services',
      value: '12',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Trusted Providers',
      value: '8',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Service Areas',
      value: '5',
      icon: MapPin,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const recentBookings = [
    {
      id: '1',
      service: 'Plumbing Repair',
      provider: 'John Smith',
      date: '2024-01-15',
      status: 'In Progress',
      trustScore: 4.8
    },
    {
      id: '2',
      service: 'Electrical Work',
      provider: 'Sarah Johnson',
      date: '2024-01-14',
      status: 'Completed',
      trustScore: 4.9
    },
    {
      id: '3',
      service: 'House Cleaning',
      provider: 'Mike Davis',
      date: '2024-01-13',
      status: 'Completed',
      trustScore: 4.7
    }
  ];

  const recommendedProviders = [
    {
      id: '1',
      name: 'David Wilson',
      service: 'Carpentry',
      trustScore: 4.9,
      reviews: 45,
      location: 'Downtown'
    },
    {
      id: '2',
      name: 'Lisa Chen',
      service: 'Home Cleaning',
      trustScore: 4.8,
      reviews: 32,
      location: 'Midtown'
    },
    {
      id: '3',
      name: 'Robert Taylor',
      service: 'Electrical',
      trustScore: 4.7,
      reviews: 28,
      location: 'Uptown'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600 mt-1">Find trusted service providers in your area</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h2>
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{booking.service}</h3>
                  <p className="text-sm text-gray-600">{booking.provider}</p>
                  <p className="text-xs text-gray-500">{booking.date}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center mb-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium ml-1">{booking.trustScore}</span>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    booking.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Providers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommended Providers</h2>
          <div className="space-y-4">
            {recommendedProviders.map((provider) => (
              <div key={provider.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{provider.name}</h3>
                  <p className="text-sm text-gray-600">{provider.service}</p>
                  <p className="text-xs text-gray-500">{provider.location}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center mb-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium ml-1">{provider.trustScore}</span>
                  </div>
                  <span className="text-xs text-gray-500">{provider.reviews} reviews</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <MapPin className="h-5 w-5 mr-2" />
            Find Services
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Calendar className="h-5 w-5 mr-2" />
            Book Service
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Star className="h-5 w-5 mr-2" />
            Rate Provider
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
