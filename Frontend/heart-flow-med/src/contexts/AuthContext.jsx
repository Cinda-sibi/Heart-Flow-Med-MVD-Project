import React, { createContext, useContext, useState, useEffect } from 'react';
import TokenService from '../config/tokenService';

// 1. Create the context
const AuthContext = createContext();

// 2. AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token and user data on mount
    const token = TokenService.getToken();
    const userRole = TokenService.getUserRole();
    const userId = TokenService.getUserId();
    const userName = TokenService.getUserName();

    if (token && userRole && userId) {
      setUser({
        id: userId,
        role: userRole,
        name: userName,
        token: token
      });
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    TokenService.clearTokens();
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. useAuth hook
export const useAuth = () => {
  return useContext(AuthContext);
};
