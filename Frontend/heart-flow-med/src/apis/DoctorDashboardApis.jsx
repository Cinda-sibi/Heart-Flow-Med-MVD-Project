import axiosInstance from '../config/axiosInstance';

// Fetch all patients
export const fetchAllPatients = async () => {
  const response = await axiosInstance.get('/list-all-patients/');
  return response.data;
};
