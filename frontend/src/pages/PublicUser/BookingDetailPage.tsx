import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MessageSquare, User, MapPin, Phone, Mail, Loader2, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import { getBookingById, createBooking } from '../../services/bookingService';
import { getAllVerifiedProviders } from '../../services/providerService';
import type { Booking } from '../../types/bookingTypes';
import toast from 'react-hot-toast';

const BookingDetailPage: React.FC = () => {
  const { id, providerId } = useParams<{ id?: string; providerId?: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingCreation, setIsBookingCreation] = useState(false);
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [notes, setNotes] = useState('');
  const [creatingBooking, setCreatingBooking] = useState(false);

  useEffect(() => {
    if (providerId) {
      // This is a booking creation page
      setIsBookingCreation(true);
      fetchProvider(parseInt(providerId));
    } else if (id) {
      // This is a booking detail page
      setIsBookingCreation(false);
      fetchBooking(parseInt(id));
    }
  }, [id, providerId]);

  const fetchBooking = async (bookingId: number) => {
    try {
      setLoading(true);
      const response = await getBookingById(bookingId);
      setBooking(response.booking);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch booking:', err);
      if (err.response?.status === 404) {
        setError('Booking not found');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view this booking');
      } else {
        setError('Failed to load booking details');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProvider = async (providerId: number) => {
    try {
      setLoading(true);
      const response = await getAllVerifiedProviders();
      const provider = response.data.find((p: any) => p.id === providerId.toString());
      if (provider) {
        setSelectedProvider(provider);
        setError(null);
      } else {
        setError('Provider not found');
      }
    } catch (err: any) {
      console.error('Failed to fetch provider:', err);
      setError('Failed to load provider details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async () => {
    if (!selectedProvider || !selectedService || !bookingDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setCreatingBooking(true);
      await createBooking({
        providerId: parseInt(selectedProvider.id),
        serviceId: selectedService.id,
        bookingDate: new Date(bookingDate).toISOString(),
        notes,
      });
      toast.success('Booking created successfully!');
      navigate('/customer/bookings');
    } catch (err: any) {
      console.error('Failed to create booking:', err);
      toast.error('Failed to create booking. Please try again.');
    } finally {
      setCreatingBooking(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return '⏳';
      case 'ACCEPTED': return '✅';
      case 'IN_PROGRESS': return '🔄';
      case 'COMPLETED': return '🎉';
      case 'CANCELLED': return '❌';
      default: return '📅';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">{isBookingCreation ? 'Loading booking form...' : 'Loading booking details...'}</p>
        </div>
      </div>
    );
  }

  if (isBookingCreation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="mb-4 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h1 className="text-3xl font-bold text-gray-900">Book a Service</h1>
              <p className="text-gray-600 mt-1">Schedule your service with {selectedProvider?.legalName || selectedProvider?.user?.name}</p>
            </div>
          </div>

          {selectedProvider && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Booking Form */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h2>

                  {/* Service Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Service</label>
                    <select
                      value={selectedService?.id || ''}
                      onChange={(e) => {
                        const service = selectedProvider.service.find((s: any) => s.id === parseInt(e.target.value));
                        setSelectedService(service);
                      }}
                      className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Choose a service...</option>
                      {selectedProvider.service?.map((service: any) => (
                        <option key={service.id} value={service.id}>
                          {service.title} - NPR {selectedProvider.price || 'Price on request'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date & Time</label>
                    <input
                      type="datetime-local"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Notes */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special instructions or requirements..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleCreateBooking}
                    disabled={creatingBooking}
                    className="w-full h-12"
                  >
                    {creatingBooking ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Creating Booking...
                      </>
                    ) : (
                      'Create Booking'
                    )}
                  </Button>
                </div>
              </div>

              {/* Provider Info Sidebar */}
              <div className="space-y-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Provider</h2>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {selectedProvider.legalName || selectedProvider.user?.name}
                      </h3>
                      <p className="text-gray-600">{selectedProvider.category?.name || 'Service Provider'}</p>
                      <div className="flex items-center mt-2 text-sm text-gray-500">
                        <span>Trust Score: {selectedProvider.trustScore || 85}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error || (!booking && !isBookingCreation)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error === 'Booking not found'
              ? "The booking you're looking for doesn't exist or may have been deleted."
              : error || 'Unable to load booking details'
            }
          </p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/customer/bookings')} className="w-full flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              View My Bookings
            </Button>
            <Button onClick={() => navigate('/providers')} variant="outline" className="w-full">
              Book a New Service
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">Unable to load booking details.</p>
          <Button onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Booking #{booking.id}</h1>
                <p className="text-gray-600 mt-1">Service booking details</p>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${getStatusColor(booking.status)}`}>
                  <span>{getStatusIcon(booking.status)}</span>
                  {booking.status.replace('_', ' ')}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Created {new Date(booking.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Details</h2>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                  <span className="text-2xl">🔧</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{booking.service.title}</h3>
                  <p className="text-gray-600 mt-1">{booking.service.description}</p>
                  <div className="flex items-center mt-3 text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    Scheduled for {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  {booking.notes && (
                    <div className="flex items-start mt-3">
                      <MessageSquare className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">{booking.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Provider Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Provider</h2>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {booking.provider.user.name || 'Provider'}
                  </h3>
                  <p className="text-gray-600">{booking.provider.category?.name || 'Service Provider'}</p>
                  <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      {booking.provider.user.email}
                    </div>
                    {booking.provider.user.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {booking.provider.user.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Customer Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Details</h2>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {booking.customer.name || 'Customer'}
                  </h3>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {booking.customer.email}
                    </div>
                    {booking.customer.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {booking.customer.phone}
                      </div>
                    )}
                    {booking.customer.address && (
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                        <span>
                          {booking.customer.address}
                          {booking.customer.district && `, ${booking.customer.district}`}
                          {booking.customer.municipality && `, ${booking.customer.municipality}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Timeline</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Booking Created</p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.createdAt).toLocaleDateString()} at {new Date(booking.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                {booking.updatedAt !== booking.createdAt && (
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${booking.status !== 'PENDING' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Last Updated</p>
                      <p className="text-xs text-gray-500">
                        {new Date(booking.updatedAt).toLocaleDateString()} at {new Date(booking.updatedAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;
