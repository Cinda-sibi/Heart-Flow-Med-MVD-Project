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
import GeneralPractitionerDashboard from './components/dashboards/GeneralPractitionerDashboard';
import SonographersDashboard from './components/dashboards/SonographersDashboard';

// Import shared pages
import Appointments from './pages/shared/Appointments';
import MedicalRecords from './pages/shared/MedicalRecords';

// Import role-specific pages
import Users from './pages/dashboard/admin/Users';
import MedicalHistory from './pages/dashboard/patient/MedicalHistory';

// import sidebars pages administrative staff
import PatientsRecord from './pages/sidebarpages/administrativestaff/PatientsRecord';
import DoctorAvailability from './pages/sidebarpages/administrativestaff/DoctorAvailability';
import BillingRecords from './pages/sidebarpages/administrativestaff/BillingRecords';

// import sidebars pages doctors
import CreateDoctorAvailability from './pages/sidebarpages/doctors/CreateDoctorAvailability';
import DoctorAppointments from './pages/sidebarpages/doctors/DoctorAppointments';
import AssiginingToSonographers from './pages/sidebarpages/doctors/AssiginingToSonographers';
import DoctorPatients from './pages/sidebarpages/doctors/DoctorPatients';

// import sidebars pages general practitioner
import PatientsReferral from './pages/sidebarpages/gp/PatientsReferral';

// import sidebars pages patients
import PatientsAppointment from './pages/sidebarpages/patients/PatientsAppointment';
import PatientsTestResults from './pages/sidebarpages/patients/PatientsTestResults';


import SonoPatientReferral from './pages/sidebarpages/sonographers/SonoPatientReferral';

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
    case 'General Practitioner':
      return <GeneralPractitionerDashboard />;
    case 'Sonographer':
      return <SonographersDashboard />;
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

      {/* Cardiologist: My Patients Route */}
       {user?.role === 'Cardiologist' && (
        <Route 
          path="/my-patients" 
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <DoctorPatients />
              </LayoutWrapper>
            </ProtectedRoute>
          } 
        />
      )}

      {/* Cardiologist: Doctors Availability Route */}
{user?.role === 'Cardiologist' && (
        <Route 
          path="/create-doctors-availability" 
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <CreateDoctorAvailability />
              </LayoutWrapper>
            </ProtectedRoute>
          } 
        />
      )}

      {/* Cardiologist: Doctors Appointments Route */}
      {user?.role === 'Cardiologist' && (
        <Route 
          path="/doctor-appointments" 
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <DoctorAppointments />
              </LayoutWrapper>
            </ProtectedRoute>
          } 
        />
      )}

      {/* Cardiologist: Assign Sonographers Route */}
      {user?.role === 'Cardiologist' && (
        <Route 
          path="/assign-sonographers" 
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <AssiginingToSonographers />
              </LayoutWrapper>
            </ProtectedRoute>
          } 
        />
      )}
     

      {/* Patient: Medical History Route */}
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

      {/* Patient: Appointments Route */}
      {user?.role === 'Patient' && (
        <Route 
          path="/my-appointments" 
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <PatientsAppointment />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
      )}

      {/* Patient: Test Results Route */}
      {user?.role === 'Patient' && (
        <Route 
          path="/test-results" 
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <PatientsTestResults />
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

      {/* Administrative Staff: Billing Records Route */}
      {user?.role === 'Administrative Staff' && (
        <Route
          path="/billing-records"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <BillingRecords />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
      )}

      {/* General Practitioner: Patients Referral Route */}
      {user?.role === 'General Practitioner' && (
        <Route
          path="/patients-referral"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <PatientsReferral />
              </LayoutWrapper>
            </ProtectedRoute>
          }
        />
      )}
        {/* Sonographer: Patients Referral Route */}
        {user?.role === 'Sonographer' && (
        <Route
          path="/sonographers-dashboard"
          element={
            <ProtectedRoute>
              <LayoutWrapper>
                <SonoPatientReferral />
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
