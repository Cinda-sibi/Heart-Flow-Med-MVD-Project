import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LockClosedIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import axiosInstance from '../../config/axiosInstance';
import TokenService from '../../config/tokenService';
import ProfileApis from '../../apis/ProfileApis';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [loginData, setLoginData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState(1); // 1: email, 2: otp+password
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const loginUser = async () => {
    try {
      const res = await axiosInstance.post('/user-login/', { email, password });
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await axiosInstance.post('/verify-otp/', { email, otp });
      return res.data;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const data = await loginUser();
      console.log('Login response:', data); // Debug log
      
      // Check if OTP is required based on the response message
      if (data.status && data.message === 'OTP sent to your email') {
        setLoginData(data);
        setShowOTPModal(true);
      } else {
        // If no OTP required, store credentials and navigate
        storeCredentials(data);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err); // Debug log
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const data = await verifyOtp();
      console.log('OTP verification response:', data); // Debug log
      
      if (data.status && data.data) {
        // Store credentials from OTP verification response
        TokenService.setToken(data.data.access);
        TokenService.setRefreshToken(data.data.refresh);
        TokenService.setUserRole(data.data.role);
        TokenService.setUserId(data.data.user_id);
        TokenService.setUserName(data.data.email);

        // Update auth context with role information
        login({
          id: data.data.user_id,
          role: data.data.role,
          name: data.data.email,
          token: data.data.access
        });

        setShowOTPModal(false);
        // Navigate to dashboard - the RoleBasedDashboard component will handle the correct dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('OTP verification error:', err); // Debug log
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || 'Invalid OTP. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setIsLoading(true);
    try {
      await loginUser(); // This will trigger a new OTP
      setError('A new OTP has been sent to your email.');
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || 'Failed to resend OTP. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const storeCredentials = (data) => {
    if (data.access) TokenService.setToken(data.access);
    if (data.refresh) TokenService.setRefreshToken(data.refresh);
    if (data.role) TokenService.setUserRole(data.role);
    if (data.user_id) TokenService.setUserId(data.user_id);
    if (data.email) TokenService.setUserName(data.email);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 overflow-y-auto">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-2xl my-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
            <LockClosedIcon className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your dashboard
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            {/* <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div> */}

            <div className="text-sm">
              <button
                type="button"
                className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                onClick={() => {
                  setShowForgotModal(true);
                  setForgotStep(1);
                  setForgotEmail("");
                  setForgotOtp("");
                  setForgotNewPassword("");
                  setForgotConfirmPassword("");
                  setForgotError("");
                  setForgotSuccess("");
                }}
              >
                Forgot your password?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Sign up
          </a>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full my-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <LockClosedIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Enter Verification Code</h3>
              <p className="mt-2 text-sm text-gray-600">
                We've sent a 6-digit code to {email}. Please enter it below.
              </p>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form className="mt-6 space-y-6" onSubmit={handleOTPSubmit}>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength="6"
                  autoComplete="one-time-code"
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-xl tracking-widest focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="------"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowOTPModal(false);
                    setError('');
                    setOtp('');
                  }}
                  className="text-sm font-medium text-gray-600 hover:text-gray-500"
                >
                  Back to login
                </button>
                <button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading || otp.length !== 6 ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </form>

            <div className="mt-4 text-center text-sm text-gray-600">
              Didn't receive a code?{' '}
              <button 
                onClick={handleResendOTP}
                disabled={isLoading}
                className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Resend code'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full my-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <LockClosedIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                {forgotStep === 1 ? 'Forgot Password' : 'Reset Password'}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {forgotStep === 1
                  ? 'Enter your email address to receive a verification code.'
                  : `Enter the code sent to ${forgotEmail} and set your new password.`}
              </p>
            </div>

            {forgotError && (
              <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{forgotError}</p>
                  </div>
                </div>
              </div>
            )}
            {forgotSuccess && (
              <div className="mt-4 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707a1 1 0 00-1.414-1.414L9 11.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{forgotSuccess}</p>
                  </div>
                </div>
              </div>
            )}

            {forgotStep === 1 && (
              <form className="mt-6 space-y-6" onSubmit={async (e) => {
                e.preventDefault();
                setForgotError("");
                setForgotSuccess("");
                setForgotLoading(true);
                try {
                  await axiosInstance.post('/forgot-password-request/', { email: forgotEmail });
                  setForgotSuccess('OTP sent to your email.');
                  setForgotStep(2);
                } catch (err) {
                  const errorMessage = err.response?.data?.detail || err.response?.data?.message || 'Failed to send OTP. Please try again.';
                  setForgotError(errorMessage);
                } finally {
                  setForgotLoading(false);
                }
              }}>
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    id="forgot-email"
                    name="forgot-email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="text-sm font-medium text-gray-600 hover:text-gray-500"
                  >
                    Back to login
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || !forgotEmail}
                    className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${forgotLoading || !forgotEmail ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {forgotLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 2 && (
              <form className="mt-6 space-y-6" onSubmit={async (e) => {
                e.preventDefault();
                setForgotError("");
                setForgotSuccess("");
                setForgotLoading(true);
                try {
                  await axiosInstance.post('/reset-password/', {
                    email: forgotEmail,
                    otp: forgotOtp,
                    new_password: forgotNewPassword,
                    confirm_password: forgotConfirmPassword
                  });
                  setForgotSuccess('Password reset successful! You can now log in.');
                  setTimeout(() => {
                    setShowForgotModal(false);
                  }, 2000);
                } catch (err) {
                  const errorMessage = err.response?.data?.detail || err.response?.data?.message || 'Failed to reset password. Please try again.';
                  setForgotError(errorMessage);
                } finally {
                  setForgotLoading(false);
                }
              }}>
                <div>
                  <label htmlFor="forgot-otp" className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Code
                  </label>
                  <input
                    id="forgot-otp"
                    name="forgot-otp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength="6"
                    autoComplete="one-time-code"
                    required
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-xl tracking-widest focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="------"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="forgot-new-password" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    id="forgot-new-password"
                    name="forgot-new-password"
                    type="password"
                    required
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="New password"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="forgot-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="forgot-confirm-password"
                    name="forgot-confirm-password"
                    type="password"
                    required
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Confirm password"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep(1);
                      setForgotOtp("");
                      setForgotNewPassword("");
                      setForgotConfirmPassword("");
                      setForgotError("");
                      setForgotSuccess("");
                    }}
                    className="text-sm font-medium text-gray-600 hover:text-gray-500"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={
                      forgotLoading ||
                      !forgotOtp ||
                      !forgotNewPassword ||
                      !forgotConfirmPassword ||
                      forgotNewPassword !== forgotConfirmPassword ||
                      forgotOtp.length !== 6
                    }
                    className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      forgotLoading ||
                      !forgotOtp ||
                      !forgotNewPassword ||
                      !forgotConfirmPassword ||
                      forgotNewPassword !== forgotConfirmPassword ||
                      forgotOtp.length !== 6
                        ? 'opacity-75 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    {forgotLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;