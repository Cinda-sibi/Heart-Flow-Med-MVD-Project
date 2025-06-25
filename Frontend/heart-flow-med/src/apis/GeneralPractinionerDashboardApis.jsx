import axiosInstance from '../config/axiosInstance';

export const referPatientReferral = (payload) => {
  return axiosInstance.post('/patient-referral/', payload);
};

export const getAdministrativeStaffList = () => {
  return axiosInstance.get('/list-administrative-staffs/');
};

export const getPatientReferrals = () => {
  return axiosInstance.get('/patient-referral/');
};


export const getRecentPatientReferrals = () => {
  return axiosInstance.get('/list-recent-referrals/');
};