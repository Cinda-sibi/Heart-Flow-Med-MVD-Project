import { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosInstance';

const useUserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/get-all-user-profile/');
      if (response.data.status) {
        setProfile(response.data.data);
        setError(null);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, error, refetch: fetchProfile };
};

export default useUserProfile; 