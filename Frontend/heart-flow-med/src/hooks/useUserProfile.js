import { useState, useEffect } from 'react';
import ProfileApis from '../apis/ProfileApis';

const useUserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await ProfileApis.getUserProfile();
      if (response.status) {
        setProfile(response.data);
        setError(null);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  // updateProfile can accept either a plain object or FormData (for image upload)
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await ProfileApis.updateUserProfile(profileData);
      if (response.status) {
        setProfile(response.data);
        setError(null);
      } else {
        setError(response.message);
      }
      return response;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return { profile, loading, error, refetch: fetchProfile, updateProfile };
};

export default useUserProfile; 