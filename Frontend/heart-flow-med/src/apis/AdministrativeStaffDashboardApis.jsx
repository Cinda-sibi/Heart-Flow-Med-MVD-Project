import axiosInstance from '../config/axiosInstance';

export const getAllDoctors = async () => {
  const response = await axiosInstance.get('/list-all-doctors/');
  return response.data;
};

export const getAllPatients = async () => {
  const response = await axiosInstance.get('/list-all-patients/');
  return response.data;
};

export const bookAppointment = async (payload) => {
  const response = await axiosInstance.post('/book-appointment/', payload);
  return response.data;
};

export const addPatient = async (payload) => {
  const response = await axiosInstance.post('/patient-registration/', payload);
  return response.data;
};

export const getAllDoctorAvailabilities = async () => {
  return await axiosInstance.get("/create-list-doctor-availability/");
};

export const getAllAppointments = async () => {
  const response = await axiosInstance.get('/list-all-appointments/');
  return response.data;
};

export const searchDoctorAvailability = async (params) => {
  // params should be an object, e.g. { doctor_name: 'John' }
  return await axiosInstance.get('/search-availability/', { params });
};

export const editAppointment = async (appointmentId, payload) => {
  const response = await axiosInstance.patch(`/edit-appointment/${appointmentId}/`, payload);
  return response.data;
};

export const cancelAppointment = async (appointmentId) => {
  const response = await axiosInstance.post(`/cancel-appointment/${appointmentId}/`);
  return response.data;
};

export const searchPatient = async (params) => {
  // params: { name }
  return await axiosInstance.get('/search-patient/', { params });
};

export const getPatientById = async (patientId) => {
  const response = await axiosInstance.get(`/get-patient-by-id/${patientId}/`);
  return response.data;
};
