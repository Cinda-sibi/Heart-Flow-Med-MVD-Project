import axiosInstance from '../config/axiosInstance';

export const fetchUpcomingAppointments = async () => {
  try {
    const response = await axiosInstance.get('/list-upcoming-appointments/');
    if (response.data.status) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch upcoming appointments');
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch upcoming appointments');
  }
};

export const listPatientAppointments = async () => {
  try {
    const response = await axiosInstance.get('/list-patient-appointment/');
    if (response.data.status) {
      return response.data.data; // Return the array of appointments
    }
    throw new Error(response.data.message || 'Failed to fetch appointments');
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch appointments');
  }
};

// Book a new appointment (for patients)
export const bookAppointment = async (payload) => {
  const response = await axiosInstance.post('/book-appointment/', payload);
  return response.data;
};

// List all doctor availabilities
export const listDoctorAvailabilities = async () => {
  const response = await axiosInstance.get('/create-list-doctor-availability/');
  return response.data;
};

// List all doctor availabilities (new endpoint)
export const listAllDoctorAvailabilities = async () => {
  const response = await axiosInstance.get('/list-avilability/');
  return response.data;
};

// Export a default object with all APIs for convenience
const PatientsDashboardApis = {
  fetchUpcomingAppointments,
  listPatientAppointments,
  bookAppointment,
  listDoctorAvailabilities,
  listAllDoctorAvailabilities,
};

export default PatientsDashboardApis;
