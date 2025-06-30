import axiosInstance from '../config/axiosInstance';

// Get all patient referrals (ongoing/linked)
export const getPatientReferrals = () => {
  return axiosInstance.get('/referrals-ongoing-linked/');
};

// Update referral status
export const updateReferralStatus = (referralId, status) => {
  return axiosInstance.patch(`/referral/${referralId}/status/`, { status });
};

// Book an appointment
export const bookAppointment = (appointmentData) => {
  return axiosInstance.post('/book-appointment/', appointmentData);
};

// Book a diagnostic appointment (test)
export const bookDiagnosticAppointment = (diagnosticData) => {
  return axiosInstance.post('/book-diagnostic-appointment/', diagnosticData);
};

// Get all staff members (nurses and sonographers)
export const getStaffMembers = () => {
  return axiosInstance.get('/staff-members/');
};

// Get all users
export const getAllUsers = () => {
  return axiosInstance.get('/all-users/');
};

// Register a new user by admin
export const addUser = (payload) => {
  return axiosInstance.post('/user-register-by-admin/', payload);
};

// Get assignable staff list (for appointment assignment)
export const getAssignableStaffList = () => {
  return axiosInstance.get('/assignable-staff-list/');
};

// Get all diagnostic tests
export const getDiagnosticTests = () => {
  return axiosInstance.get('/diagnostic-tests/');
};

// Get all booked diagnostic appointments
export const getDiagnosticAppointmentsList = () => {
  return axiosInstance.get('/diagnostic-appointments-list/');
}; 