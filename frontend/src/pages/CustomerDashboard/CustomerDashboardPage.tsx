import React from 'react';
import CustomerLayout from '../../components/CustomerDashboard/layouts/CustomerLayout';
import CustomerDashboard from '../../components/CustomerDashboard/layouts/CustomerDashboard';

const CustomerDashboardPage: React.FC = () => {
  return (
    <CustomerLayout>
      <CustomerDashboard />
    </CustomerLayout>
  );
};

export default CustomerDashboardPage;
