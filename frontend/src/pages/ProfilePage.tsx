import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../Redux/store';
import { useNavigate } from 'react-router-dom';
import { logoutSuccess } from '../Redux/slices/authSlice';
import { fetchMyServices, createNewService, removeService } from '../Redux/slices/serviceSlice';
import { getAllCategories } from '../services/categoryService';
import { logoutUser } from '../services/authService';
import type { Category } from '../types/categoryTypes';
import type { CreateServiceData } from '../types/serviceTypes';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { profile, isAuthenticated, loading: authLoading } = useSelector((state: RootState) => state.auth);
  const { myServices, loading: serviceLoading } = useSelector((state: RootState) => state.services);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Local State for Service Management
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<CreateServiceData>({
    title: '',
    description: '',
    price: 0,
    location: '',
    categoryId: '',
  });

  useEffect(() => {
    if (isAuthenticated && profile?.role === 'PROVIDER') {
      dispatch(fetchMyServices());
      fetchCategories();
    }
  }, [dispatch, isAuthenticated, profile]);

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      dispatch(logoutSuccess());
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }
    try {
      await dispatch(createNewService(formData)).unwrap();
      toast.success('Service created successfully!');
      setShowCreateModal(false);
      setFormData({ title: '', description: '', price: 0, location: '', categoryId: '' });
    } catch (error: any) {
      toast.error(error || 'Failed to create service');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await dispatch(removeService(id)).unwrap();
        toast.success('Service deleted successfully');
      } catch (error: any) {
        toast.error(error || 'Failed to delete service');
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view your profile</h2>
        <button
          onClick={() => navigate('/login')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 px-8 py-10 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="h-24 w-24 rounded-full bg-white text-blue-600 flex items-center justify-center text-4xl font-bold uppercase shadow-lg">
                  {profile.name?.charAt(0) || profile.email.charAt(0)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{profile.name || 'User'}</h1>
                  <p className="text-blue-100 mt-1">{profile.email}</p>
                  <div className="mt-3 flex items-center space-x-3">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-sm border border-white/30">
                      {profile.role}
                    </span>
                    {profile.isVerified && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/80 backdrop-blur-sm flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6 md:mt-0">
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg backdrop-blur-sm transition-all text-sm font-semibold"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Profile Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-lg font-medium text-gray-900 mt-1">{profile.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email Address</label>
                  <p className="text-lg font-medium text-gray-900 mt-1">{profile.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-lg font-medium text-gray-900 mt-1">{profile.phone || 'N/A'}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Type</label>
                  <p className="text-lg font-medium text-gray-900 mt-1 capitalize">{profile.role.toLowerCase()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Member Since</label>
                  <p className="text-lg font-medium text-gray-900 mt-1">
                    {new Date(profile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Status</label>
                  <div className="mt-1">
                    {profile.isVerified ? (
                      <span className="text-green-600 font-medium flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Active & Verified
                      </span>
                    ) : (
                      <span className="text-amber-600 font-medium flex items-center">
                        <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                        Pending Verification
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Provider Specific Section */}
            {profile.role === 'PROVIDER' && (
              <div className="mt-10 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">My Services</h2>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-semibold hover:underline"
                  >
                    + Add New Service
                  </button>
                </div>
                
                {serviceLoading ? (
                   <div className="text-center py-8">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                   </div>
                ) : myServices.length === 0 ? (
                  <div className="bg-blue-50 rounded-xl p-8 text-center border border-blue-100 border-dashed">
                    <div className="mx-auto h-12 w-12 text-blue-400 mb-3">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No Services Listed Yet</h3>
                    <p className="text-gray-500 mt-1 max-w-sm mx-auto">Start offering your professional services to customers by creating your first service listing.</p>
                    <button 
                      onClick={() => setShowCreateModal(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
                    >
                      Add New Service
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myServices.map((service) => (
                      <div key={service.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded mb-2">
                              {service.category?.name}
                            </span>
                            <h3 className="font-bold text-gray-900">{service.title}</h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{service.description}</p>
                          </div>
                          <div className="text-right">
                            <span className="block font-bold text-gray-900">Rs. {service.price}</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                           <span className="text-xs text-gray-500 flex items-center">
                             <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                             </svg>
                             {service.location}
                           </span>
                           <div className="flex space-x-2">
                             <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold">Edit</button>
                             <button 
                               onClick={() => handleDeleteService(service.id)}
                               className="text-red-600 hover:text-red-800 text-xs font-semibold"
                             >
                               Delete
                             </button>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Customer Specific Section */}
            {profile.role === 'CUSTOMER' && (
              <div className="mt-10 pt-6 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h2>
                 <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-200 border-dashed">
                  <p className="text-gray-500">No recent bookings or activity found.</p>
                  <button onClick={() => navigate('/services')} className="mt-4 text-blue-600 font-medium hover:underline">
                    Browse Services
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Service Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Add New Service</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateService} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g. Professional House Cleaning"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Select a Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="e.g. Kathmandu, Bhaktapur"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Describe your service in detail..."
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={serviceLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {serviceLoading ? 'Creating...' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
