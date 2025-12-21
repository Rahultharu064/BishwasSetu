import React from 'react';
import { Outlet } from 'react-router-dom';
import CustomerHeader from '../sections/CustomerHeader';
import CustomerSidebar from '../sections/CustomerSidebar';

const CustomerLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader />
      <div className="flex">
        <CustomerSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
