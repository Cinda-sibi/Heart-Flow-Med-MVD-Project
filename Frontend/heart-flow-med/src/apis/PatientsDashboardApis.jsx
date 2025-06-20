import axiosInstance from '../config/axiosInstance';

export const fetchUpcomingAppointments = async () => {
  const response = await axiosInstance.get('/list-upcoming-appointments/');
  return response.data;
};
