import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Star, MessageSquare } from 'lucide-react';
import Button from '../../ui/Button';

interface Booking {
  id: string;
  serviceName: string;
  providerName: string;
  providerImage: string;
  date: string;
  time: string;
  location: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  price: string;
  trustScore: number;
  canReview: boolean;
}

const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    // Mock data - replace with API call
    const mockBookings: Booking[] = [
      {
        id: '1',
        serviceName: 'Plumbing Repair',
        providerName: 'John Smith',
        providerImage: '/api/placeholder/40/40',
        date: '2024-01-20',
        time: '10:00 AM',
        location: '123 Main St, Downtown',
        status: 'confirmed',
        price: '₹800',
        trustScore: 4.8,
        canReview: false
      },
      {
        id: '2',
        serviceName: 'House Cleaning',
        providerName: 'Sarah Johnson',
        providerImage: '/api/placeholder/40/40',
        date: '2024-01-18',
        time: '2:00 PM',
        location: '456 Oak Ave, Midtown',
        status: 'completed',
        price: '₹1200',
        trustScore: 4.6,
        canReview: true
      },
      {
        id: '3',
        serviceName: 'Electrical Work',
        providerName: 'Mike Davis',
        providerImage: '/api/placeholder/40/40',
        date: '2024-01-15',
        time: '9:00 AM',
        location: '789 Pine St, Uptown',
        status: 'completed',
        price: '₹600',
        trustScore: 4.9,
        canReview: true
      }
    ];
    setBookings(mockBookings);
  }, []);

  const filteredBookings = bookings.filter(booking =>
    filterStatus === 'all' || booking.status === filterStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings(bookings.map(booking =>
      booking.id === bookingId
        ? { ...booking, status: 'cancelled' as const }
        : booking
    ));
  };

  const handleReviewProvider = (bookingId: string) => {
    // Navigate to review page or open review modal
    console.log('Review booking:', bookingId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-600 mt-1">Manage your service bookings and track progress</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All Bookings' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between">
              <div className="flex items-start space-x-4 mb-4 lg:mb-0">
                <img
                  src={booking.providerImage}
                  alt={booking.providerName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{booking.serviceName}</h3>
                  <p className="text-gray-600">{booking.providerName}</p>

                  <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {booking.date}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {booking.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {booking.location}
                    </div>
                  </div>

                  <div className="flex items-center mt-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium ml-1">{booking.trustScore}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:items-end space-y-2">
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{booking.price}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                <div className="flex space-x-2">
                  {booking.status === 'confirmed' && (
                    <Button
                      onClick={() => handleCancelBooking(booking.id)}
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Cancel
                    </Button>
                  )}
                  {booking.canReview && (
                    <Button
                      onClick={() => handleReviewProvider(booking.id)}
                      className="flex items-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Review
                    </Button>
                  )}
                  {booking.status === 'completed' && !booking.canReview && (
                    <Button variant="outline" disabled>
                      Reviewed
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filterStatus === 'all' ? 'You haven\'t made any bookings yet.' : `No ${filterStatus} bookings found.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
