import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Calendar,
  Star,
  MessageSquare,
  Settings,
  User,
  MapPin
} from 'lucide-react';

const CustomerSidebar: React.FC = () => {
  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/customer/dashboard' },
    { icon: MapPin, label: 'Find Services', path: '/services' },
    { icon: Calendar, label: 'My Bookings', path: '/customer/bookings' },
    { icon: Star, label: 'My Reviews', path: '/customer/reviews' },
    { icon: MessageSquare, label: 'Complaints', path: '/customer/complaints' },
    { icon: User, label: 'Profile', path: '/customer/profile' },
    { icon: Settings, label: 'Settings', path: '/customer/settings' },
  ];

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200">
      <nav className="mt-8">
        <div className="px-4 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CustomerSidebar;
