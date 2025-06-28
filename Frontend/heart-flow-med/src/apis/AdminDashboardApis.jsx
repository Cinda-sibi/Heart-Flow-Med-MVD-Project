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

// Get all users
export const getAllUsers = () => {
  return axiosInstance.get('/all-users/');
}; 