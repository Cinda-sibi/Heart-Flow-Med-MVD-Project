import axiosInstance from './axiosInstance';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_ROLE_KEY = 'user_role';
const USER_ID_KEY = 'user_id';
const USER_NAME_KEY = 'user_name';

const TokenService = {
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  setRefreshToken(token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  getRefreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setUserRole(role) {
    localStorage.setItem(USER_ROLE_KEY, role);
  },

  getUserRole() {
    return localStorage.getItem(USER_ROLE_KEY);
  },

  setUserId(id) {
    localStorage.setItem(USER_ID_KEY, id);
  },

  getUserId() {
    return localStorage.getItem(USER_ID_KEY);
  },

  setUserName(name) {
    localStorage.setItem(USER_NAME_KEY, name);
  },

  getUserName() {
    return localStorage.getItem(USER_NAME_KEY);
  },

  clearTokens() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_NAME_KEY);
  },

  refreshToken: async () => {
    console.log('Starting token refresh');
    const refreshToken = TokenService.getRefreshToken();
    console.log('Current refresh token exists:', !!refreshToken);

    try {
      console.log('Making refresh token request');
      const response = await axiosInstance.post('/token-refresh/', {
        refresh: refreshToken,
      });

      console.log('Refresh response:', {
        success: !!response.data,
        hasAccessToken: !!response.data?.access,
      });

      if (response.data.access) {
        TokenService.setToken(response.data.access);
        return response.data;
      } else {
        console.error('No access token in refresh response');
        throw new Error('No access token received');
      }
    } catch (error) {
      console.error('Token refresh error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      TokenService.clearTokens();
      throw error;
    }
  },
};

export default TokenService;