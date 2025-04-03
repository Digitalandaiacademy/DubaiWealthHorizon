import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AdminLayout from './AdminLayout';

const AdminRoute = () => {
  const { user } = useAuthStore();

  // Vérifier si l'utilisateur est connecté et est un administrateur
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Envelopper le contenu dans le layout administrateur
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export default AdminRoute;
