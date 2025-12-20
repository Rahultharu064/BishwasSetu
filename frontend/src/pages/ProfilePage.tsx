import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../Redux/store';
import { useNavigate } from 'react-router-dom';
import { logoutSuccess } from '../Redux/slices/authSlice';
import { logoutUser } from '../services/authService';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { profile, isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

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

  if (loading) {
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
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold hover:underline">
                    Manage Services
                  </button>
                </div>
                <div className="bg-blue-50 rounded-xl p-8 text-center border border-blue-100 border-dashed">
                  <div className="mx-auto h-12 w-12 text-blue-400 mb-3">
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">No Services Listed Yet</h3>
                  <p className="text-gray-500 mt-1 max-w-sm mx-auto">Start offering your professional services to customers by creating your first service listing.</p>
                  <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm">
                    Add New Service
                  </button>
                </div>
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
    </div>
  );
};

export default ProfilePage;
