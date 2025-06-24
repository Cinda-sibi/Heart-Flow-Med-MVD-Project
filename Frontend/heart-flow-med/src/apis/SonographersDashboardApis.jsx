import axiosInstance from '../config/axiosInstance';

export const uploadSonographyReport = async (referralId, reportFile) => {
  const formData = new FormData();
  formData.append('report', reportFile);

  try {
    const response = await axiosInstance.post(
      `/sonography-referral-upload-report/${referralId}/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getSonographyReport = async (referralId) => {
  try {
    const response = await axiosInstance.get(`/sonography-report/${referralId}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchLatestSonographyReferrals = async () => {
  try {
    const response = await axiosInstance.get('/latest-sonography-referrals/');
    return response.data;
  } catch (error) {
    throw error;
  }
};
