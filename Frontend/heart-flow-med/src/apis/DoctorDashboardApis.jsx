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
export const fetchAllSonographers = async (params = {}) => {
  const response = await axiosInstance.get('/search-sonographer/', { params });
  return response.data;
};
