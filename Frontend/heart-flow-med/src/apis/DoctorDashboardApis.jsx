import axiosInstance from '../config/axiosInstance';

// Fetch all doctors patients
export const fetchAllPatients = async () => {
  const response = await axiosInstance.get('/doctor-recent-3-patients/');
  return response.data;
};

// Create doctor availability
export const createDoctorAvailability = async (payload) => {
  const response = await axiosInstance.post('/create-list-doctor-availability/', payload);
  return response.data;
};

// Create doctor leave
export const createDoctorLeave = async (payload) => {
  const response = await axiosInstance.post('/doctor-leave/', payload);
  return response.data;
};

// Fetch today's appointments for the doctor
export const fetchTodaysAppointments = async () => {
  const response = await axiosInstance.get('/list-todays-appointment/');
  return response.data;
};

// Fetch doctor patient count
export const fetchDoctorPatientCount = async () => {
  const response = await axiosInstance.get('/doctor-patient-count/');
  return response.data;
};

// Fetch doctor's today's appointments count
export const fetchDoctorTodaysAppointmentsCount = async () => {
  const response = await axiosInstance.get('/doctor-todays-appointments-count/');
  return response.data;
};

// Fetch all appointments for the logged-in doctor
export const fetchAllDoctorAppointments = async () => {
  const response = await axiosInstance.get('/list-doc-all-appointment/');
  return response.data;
};

// Fetch the logged-in doctor's availability
export const fetchDoctorAvailability = async () => {
  const response = await axiosInstance.get('/list-doc-availability/');
  return response.data;
};

// Fetch all sonographers
export const fetchAllSonographers = async () => {
  const response = await axiosInstance.get('/list-sonographers/');
  return response.data;
};

// Assign a patient to a sonographer
export const assignPatientToSonographer = async (payload) => {
  // payload: { patient_id, sonographer_id }
  const response = await axiosInstance.post('/sonography-referral/', payload);
  return response.data;
};

// Fetch patients of the logged-in doctor
export const fetchPatientsByLoginDoctor = async () => {
  const response = await axiosInstance.get('/list-patients-by-login-doc/');
  return response.data;
};

// Update doctor availability
export const updateDoctorAvailability = async (pk, payload) => {
  const response = await axiosInstance.patch(`/update-availability/${pk}/`, payload);
  return response.data;
};

// List sonography referrals
export const fetchSonographyReferrals = async () => {
  const response = await axiosInstance.get('/sonography-referral/');
  return response.data;
};

// Fetch a sonography report by referral_id
export const fetchSonographyReport = async (referral_id) => {
  const response = await axiosInstance.get(`/sonography-report/${referral_id}/`);
  return response.data;
};

// PATCH doctor notes to a referral
export const addDoctorNotesToReferral = async (referralId, doctorNotes) => {
  const response = await axiosInstance.patch(`/add-notes-by-doc/${referralId}/`, { doctor_notes: doctorNotes });
  return response.data;
};

// Fetch referrals by status
export const fetchReferralsByStatus = async (status) => {
  const response = await axiosInstance.get(`/referrals-by-status/${status}/`);
  return response.data;
};

// Register a patient (add patient)
export const addPatient = async (payload) => {
  const response = await axiosInstance.post('/add-patient/', payload);
  return response.data;
};

// Fetch patient details by patient ID
export const fetchPatientById = async (patientId) => {
  const response = await axiosInstance.get(`/doc-patient-by-id/${patientId}/`);
  return response.data;
};

// Fetch test results for a patient by ID
export const fetchPatientTestResults = async (patientId) => {
  const response = await axiosInstance.get(`/patients-test-results/${patientId}/`);
  return response.data;
};