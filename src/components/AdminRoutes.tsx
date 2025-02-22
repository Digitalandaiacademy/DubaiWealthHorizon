import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import ProtectedAdminRoute from './ProtectedAdminRoute';
import AdminDashboard from '../pages/admin/Dashboard';
import UserActivity from '../pages/admin/UserActivity';
import UserTracking from '../pages/admin/UserTracking';
import AdminSettings from '../pages/admin/AdminSettings';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminPayments from '../pages/admin/AdminPayments';
import AdminWithdrawals from '../pages/admin/AdminWithdrawals';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedAdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="user-activity" element={<UserActivity />} />
          <Route path="user-tracking" element={<UserTracking />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="withdrawals" element={<AdminWithdrawals />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
