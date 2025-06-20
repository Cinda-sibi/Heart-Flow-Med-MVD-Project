import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OTPVerification from './pages/auth/OTPVerification';
import NotFound from './pages/NotFound';
import Layout from './components/layout/Layout';
import Profile from './pages/Profile';

// Import all dashboards
import AdminDashboard from './components/dashboards/AdminDashboard';
import CardiologistDashboard from './components/dashboards/CardiologistDashboard';
import NurseDashboard from './components/dashboards/NurseDashboard';
import PatientDashboard from './components/dashboards/PatientDashboard';
import AdministrativestaffDashboard from './components/dashboards/AdministrativestaffDashboard';

// Import shared pages
import Appointments from './pages/shared/Appointments';
import MedicalRecords from './pages/shared/MedicalRecords';

// Import role-specific pages
import Users from './pages/dashboard/admin/Users';
import MedicalHistory from './pages/dashboard/patient/MedicalHistory';

// import sidebars pages administrative staff
import PatientsRecord from './pages/sidebarpages/administrativestaff/PatientsRecord';
import DoctorAvailability from './pages/sidebarpages/administrativestaff/DoctorAvailability';

// Protected Route Component with role-based routing
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Role-based Dashboard Component
const RoleBasedDashboard = () => {
  const { user } = useAuth();

  switch (user.role) {
    case 'Admin':
      return <AdminDashboard />;
    case 'Cardiologist':
      return <CardiologistDashboard />;
    case 'Nurse':
      return <NurseDashboard />;
    case 'Patient':
      return <PatientDashboard />;
    case 'Administrative Staff':
      return <AdministrativestaffDashboard />;
    default:
      return <Navigate to="/login" />;
  }
};

// Layout Wrapper Component
const LayoutWrapper = ({ children }) => {
  return (
    <Layout>
      {children}
    </Layout>
  );
};

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<OTPVerification />} />

      {/* Protected Routes with Layout */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <LayoutWrapper>
              <RoleBasedDashboard />
            </LayoutWrapper>
          </ProtectedRoute>
        } 
      />

      {/* Shared Protected Routes */}
      <Route 
        path="/appointments" 
        element={
          <ProtectedRoute>
            <LayoutWrapper>
              <Appointments />
            </LayoutWrapper>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/records" 
        element={
          <ProtectedRoute>
            <LayoutWrapper>
              <MedicalRecords />
            </LayoutWrapper>
          </ProtectedRoute>
        } 
      />

      {/* Role-specific Protected Routes */}
      {user?.role === 'Admin' && (
        <Route 
          path="/users" 
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <Users />
              </LayoutWrapper>
            </ProtectedRoute>
          } 
        />
      )}

      {user?.role === 'Patient' && (
        <Route 
          path="/medical-history" 
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <MedicalHistory />
              </LayoutWrapper>
            </ProtectedRoute>
          } 
        />
      )}

      {/* Administrative Staff: Patients Record Route */}
      {user?.role === 'Administrative Staff' && (
        <Route
          path="/patients-record"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <PatientsRecord />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
      )}

      {/* Administrative Staff: Doctor Availability Route */}
      {user?.role === 'Administrative Staff' && (
        <Route
          path="/doctors-availability"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <DoctorAvailability />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
      )}

      {/* Profile Route */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Default Routes */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
