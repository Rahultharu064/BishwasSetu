import React, { useState, useEffect } from 'react';
import { Calendar, MessageSquare, Loader2 } from 'lucide-react';
import Button from '../../ui/Button';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../Redux/store';
import { getCustomerBookings, updateBookingStatus } from '../../../services/bookingService';
import type { Booking } from '../../../types/bookingTypes';
import socketService from '../../../services/socketService';
import toast from 'react-hot-toast';

const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [updatingBooking, setUpdatingBooking] = useState<number | null>(null);
  const isConnected = useSelector((state: RootState) => state.socket.isConnected);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (!isConnected) return;

    const handleStatusUpdate = (data: { booking: Booking; message: string }) => {
      console.log('Received booking status update:', data);
      setBookings((prevBookings: Booking[]) =>
        prevBookings.map((b: Booking) => b.id === data.booking.id ? data.booking : b)
      );
      toast.success(data.message, {
        icon: '📅',
        duration: 5000
      });
    };

    const handleBookingCancelled = (data: { booking: Booking; message: string }) => {
      console.log('Received booking cancellation:', data);
      setBookings((prevBookings: Booking[]) =>
        prevBookings.map((b: Booking) => b.id === data.booking.id ? data.booking : b)
      );
      toast.error(data.message, {
        icon: '🚫'
      });
    };

    socketService.on('booking:statusUpdate', handleStatusUpdate);
    socketService.on('booking:cancelled', handleBookingCancelled);

    return () => {
      socketService.off('booking:statusUpdate', handleStatusUpdate);
      socketService.off('booking:cancelled', handleBookingCancelled);
    };
  }, [isConnected]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getCustomerBookings();
      setBookings(response.bookings || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking =>
    filterStatus === 'all' || booking.status.toLowerCase() === filterStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    try {
      setUpdatingBooking(bookingId);
      await updateBookingStatus(bookingId, { status: 'CANCELLED' });
      // Refresh bookings
      await fetchBookings();
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      setError('Failed to cancel booking. Please try again.');
    } finally {
      setUpdatingBooking(null);
    }
  };

  const handleReviewProvider = (bookingId: number) => {
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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading bookings...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchBookings} className="mt-2">
            Try Again
          </Button>
        </div>
      )}

      {/* Filters */}
      {!loading && !error && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px - 4 py - 2 rounded - lg text - sm font - medium transition - colors ${filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } `}
                >
                  {status === 'all' ? 'All Bookings' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {booking.provider.user.name?.charAt(0) || booking.provider.user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{booking.service.title}</h3>
                      <p className="text-gray-600">{booking.provider.user.name || booking.provider.user.email}</p>

                      <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(booking.bookingDate).toLocaleDateString()}
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="flex items-center mt-2">
                          <MessageSquare className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-600">{booking.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col lg:items-end space-y-2">
                    <div className="text-right">
                      <span className={`inline - flex px - 2 py - 1 text - xs font - semibold rounded - full ${getStatusColor(booking.status)} `}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      {(booking.status === 'PENDING' || booking.status === 'ACCEPTED') && (
                        <Button
                          onClick={() => handleCancelBooking(booking.id)}
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          disabled={updatingBooking === booking.id}
                        >
                          {updatingBooking === booking.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Cancel'
                          )}
                        </Button>
                      )}
                      {booking.status === 'COMPLETED' && (
                        <Button
                          onClick={() => handleReviewProvider(booking.id)}
                          className="flex items-center gap-2"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Review
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && !error && filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filterStatus === 'all' ? 'You haven\'t made any bookings yet.' : `No ${filterStatus.replace('_', ' ')} bookings found.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
