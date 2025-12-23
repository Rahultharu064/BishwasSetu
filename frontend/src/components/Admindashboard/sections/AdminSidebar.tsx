import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutSuccess } from '../../../Redux/slices/authSlice';
import toast from 'react-hot-toast';
import {
    LayoutDashboard,
    Users,
    FileText,
    BarChart3,
    Shield,
    Settings,
    LogOut,
    Package
} from 'lucide-react';

interface AdminSidebarProps {
    isOpen: boolean;
    onClose?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/users', label: 'Users', icon: Users },
        { path: '/admin/provider-verification', label: 'Provider Verification', icon: Shield },
        { path: '/admin/complaints', label: 'Complaints', icon: FileText },
        { path: '/admin/categories', label: 'Categories', icon: BarChart3 },
        { path: '/admin/services', label: 'Services', icon: Package },
        { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    const handleLogout = () => {
        dispatch(logoutSuccess());
        toast.success('Logged out successfully');
        navigate('/login');
    };

    return (
        <>
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 shadow-sm transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } md:relative md:translate-x-0 flex flex-col`}
            >
                {/* Brand Header */}
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">B</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">BishwasSetu</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2">
                        Admin Menu
                    </p>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={onClose}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon
                                    size={20}
                                    className={`transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                                        }`}
                                />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Actions */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors group"
                    >
                        <LogOut size={20} className="text-red-400 group-hover:text-red-600" />
                        <span>Sign Out</span>
                    </button>

                    <div className="mt-4 px-3 py-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-center text-gray-500 font-medium">
                            v1.0.0 &bull; Admin Portal
                        </p>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile sidebar */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
                    onClick={onClose}
                ></div>
            )}
        </>
    );
};

export default AdminSidebar;
