import axiosInstance from '../config/axiosInstance';

export const ProfileApis = {
  // Get user profile
  getUserProfile: async () => {
    try {
      const response = await axiosInstance.get('/get-all-user-profile/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateUserProfile: async (profileData) => {
    try {
      let config = {};
      let data = profileData;
      if (profileData instanceof FormData) {
        config.headers = { 'Content-Type': 'multipart/form-data' };
      }
      const response = await axiosInstance.patch('/update-user-profile/', data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search patients
  searchPatients: async (searchParams) => {
    try {
      const response = await axiosInstance.get('/search-patient/', { params: searchParams });
      console.log("Patients after search:", response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search doctors
  searchDoctors: async (searchParams) => {
    try {
      const response = await axiosInstance.get('/search-doctor/', { params: searchParams });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get notifications for the logged-in user
  getNotifications: async () => {
    try {
      const response = await axiosInstance.get('/my-notifications/');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default ProfileApis; 