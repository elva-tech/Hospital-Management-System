import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import Login from './pages/Login';
import { DashboardLayout } from './layouts/DashboardLayout';

import Reception from './pages/Reception';
import DoctorEnhanced from './pages/DoctorEnhanced';
import Pharmacy from './pages/Pharmacy';
import Billing from './pages/Billing';
import Laboratory from './pages/Laboratory';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
     // fallback routing if trying to access restricted page
     if (user.role === 'DOCTOR') return <Navigate to="/doctor" />;
     if (user.role === 'RECEPTIONIST') return <Navigate to="/reception" />;
     if (user.role === 'PHARMACIST') return <Navigate to="/pharmacy" />;
     return <Navigate to="/" />;
  }
  return children;
};

// Auto-routing based on role
const RootRouteRedirect = () => {
   const { user } = useAuthStore();
   if (!user) return <Navigate to="/login" />;
   if (user.role === 'ADMIN') return <Navigate to="/reception" />; // Admins start at reception
   if (user.role === 'DOCTOR') return <Navigate to="/doctor" />;
   if (user.role === 'PHARMACIST') return <Navigate to="/pharmacy" />;
   return <Navigate to="/reception" />;
}

function App() {
  return (
    <Router>
      <div className="min-h-screen w-full flex flex-col font-sans">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRouteRedirect />} />

          <Route path="/reception" element={<ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN']}><Reception /></ProtectedRoute>} />
          <Route path="/doctor" element={<ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}><DoctorEnhanced /></ProtectedRoute>} />
          <Route path="/pharmacy" element={<ProtectedRoute allowedRoles={['PHARMACIST', 'ADMIN']}><Pharmacy /></ProtectedRoute>} />
          <Route path="/billing" element={<ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN']}><Billing /></ProtectedRoute>} />
          <Route path="/laboratory" element={<ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN']}><Laboratory /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

