import React, { useState } from 'react';
import { Menu, Bell, Search, ChevronDown, User, LogOut, Settings } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type{ RootState } from '../../../Redux/store';
import { logoutSuccess } from '../../../Redux/slices/authSlice';
import toast from 'react-hot-toast';
import Button from '../../ui/Button';

interface HeaderProps {
    onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
    const { profile } = useSelector((state: RootState) => state.auth);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logoutSuccess());
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <header className="bg-white border-b border-gray-100 h-16 px-6 flex items-center justify-between sticky top-0 z-40">
            {/* Left: Mobile Toggle & Title */}
            <div className="flex items-center gap-4">
                <Button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-gray-500 hover:bg-gray-50 rounded-lg md:hidden transition-colors"
                >
                    <Menu size={24} />
                </Button>

                {/* Search Bar (Hidden on mobile) */}
                <div className="hidden md:flex items-center relative">
                    <Search className="absolute left-3 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search bookings, services..."
                        className="pl-10 pr-4 py-2 w-64 bg-gray-50 border-none rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 md:gap-4">
                {/* Notifications */}
                <Button className="relative p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-full transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </Button>

                {/* Vertical Divider */}
                <div className="h-8 w-px bg-gray-100 hidden md:block"></div>

                {/* Profile Dropdown */}
                <div className="relative">
                    <Button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">
                            {profile?.name?.charAt(0).toUpperCase() || 'P'}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-medium text-gray-700 leading-none">{profile?.name || 'Provider'}</p>
                            <p className="text-xs text-gray-500 mt-0.5 capitalize">{profile?.role?.toLowerCase()}</p>
                        </div>
                        <ChevronDown size={16} className="text-gray-400 hidden md:block" />
                    </Button>

                    {/* Dropdown Menu */}
                    {isProfileOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-30"
                                onClick={() => setIsProfileOpen(false)}
                            ></div>
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-40 transform origin-top-right transition-all">
                                <div className="px-4 py-3 border-b border-gray-50 md:hidden">
                                    <p className="text-sm font-semibold text-gray-800">{profile?.name}</p>
                                    <p className="text-xs text-gray-500">{profile?.email}</p>
                                </div>

                                <button onClick={() => navigate('/provider/profile')} className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                                    <User size={16} /> Profile
                                </button>
                                <button onClick={() => navigate('/provider/settings')} className="w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                                    <Settings size={16} /> Settings
                                </button>
                                <div className="h-px bg-gray-50 my-1"></div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
