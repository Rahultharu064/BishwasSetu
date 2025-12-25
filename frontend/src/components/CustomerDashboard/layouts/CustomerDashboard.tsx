import React, { useEffect, useState } from 'react';
import { MapPin, Star, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { getCustomerBookings } from '../../../services/bookingService';
import { getAllVerifiedProviders } from '../../../services/providerService';
import type { Booking } from '../../../types/bookingTypes';

interface RecommendedProvider {
  id: string;
  name: string;
  service: string;
  location: string;
  trustScore: number;
  reviews: number;
}

const CustomerDashboard: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [recommendedProviders, setRecommendedProviders] = useState<RecommendedProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch bookings
        const bookingsResponse = await getCustomerBookings();
        setBookings(bookingsResponse.bookings || []);

        // Fetch recommended providers
        const providersResponse = await getAllVerifiedProviders();
        const transformedProviders: RecommendedProvider[] = providersResponse.data
          .slice(0, 5) // Limit to 5 recommended providers
          .map((provider: any) => ({
            id: provider.id.toString(),
            name: provider.legalName || provider.user.name,
            service: provider.service?.[0]?.title || provider.category?.name || 'General Services',
            location: provider.serviceDistrict || provider.user.district || 'Unknown',
            trustScore: provider.trustScore || 85,
            reviews: 0, // Placeholder - would need review system
          }));
        setRecommendedProviders(transformedProviders);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      title: 'Active Bookings',
      value: bookings.filter(b => ['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(b.status)).length.toString(),
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Completed Services',
      value: bookings.filter(b => b.status === 'COMPLETED').length.toString(),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Trusted Providers',
      value: new Set(bookings.map(b => b.providerId)).size.toString(),
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Total Bookings',
      value: bookings.length.toString(),
      icon: MapPin,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const recentBookings = bookings.slice(0, 5).map((booking) => ({
    id: booking.id.toString(),
    service: booking.service.title,
    provider: booking.provider.user.name || booking.provider.user.email,
    date: new Date(booking.bookingDate).toLocaleDateString(),
    status: booking.status,
    trustScore: 4.5 // This would come from provider trust score in a real implementation
  }));

  

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
                    booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    booking.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    booking.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' :
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
