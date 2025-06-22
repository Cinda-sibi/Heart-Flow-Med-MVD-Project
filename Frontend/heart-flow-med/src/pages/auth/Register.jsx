import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LockClosedIcon, EnvelopeIcon, UserIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import axiosInstance from '../../config/axiosInstance';
import TokenService from '../../config/tokenService';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'Patient', // Default role
  });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [registrationData, setRegistrationData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error for the field being changed
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});
    setIsLoading(true);

    try {
      // Prepare data with only basic details
      const requestData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };

      const response = await axiosInstance.post('/user-registration/', requestData);

      console.log('Registration response:', response.data);

      if (response.data.status) {
        setRegistrationData(response.data);
        setShowOTPModal(true);
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.data?.message && typeof err.response.data.message === 'object') {
        // Handle validation errors
        setValidationErrors(err.response.data.message);
      } else {
        // Handle other errors
        const errorMessage = err.response?.data?.detail || err.response?.data?.message || 'Registration failed. Please try again.';
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axiosInstance.post('/verify-otp/', {
        email: formData.email,
        otp: otp
      });

      console.log('OTP verification response:', response.data);

      if (response.data.status && response.data.data) {
        // Store credentials
        TokenService.setToken(response.data.data.access);
        TokenService.setRefreshToken(response.data.data.refresh);
        TokenService.setUserRole(response.data.data.role);
        TokenService.setUserId(response.data.data.user_id);
        TokenService.setUserName(response.data.data.email);

        // Update auth context
        login({
          id: response.data.data.user_id,
          role: response.data.data.role,
          name: response.data.data.email,
          token: response.data.data.access
        });

        setShowOTPModal(false);
        // Navigate to dashboard - the RoleBasedDashboard component will handle the correct dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
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
      const response = await axiosInstance.post('/resend-otp/', {
        email: formData.email
      });
      if (response.data.status) {
        setError('A new OTP has been sent to your email.');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || 'Failed to resend OTP. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderFieldError = (fieldName) => {
    if (validationErrors[fieldName]) {
      return (
        <p className="mt-1 text-sm text-red-600">
          {Array.isArray(validationErrors[fieldName]) 
            ? validationErrors[fieldName][0] 
            : validationErrors[fieldName]}
        </p>
      );
    }
    return null;
  };

  const renderField = (fieldName, label, type = 'text', placeholder = '', icon = UserIcon, required = false, options = null) => {
    const IconComponent = icon;
    return (
      <div>
        <label htmlFor={fieldName} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <IconComponent className="h-5 w-5 text-gray-400" />
          </div>
          {type === 'select' ? (
            <select
              id={fieldName}
              name={fieldName}
              required={required}
              className={`block w-full pl-10 pr-3 py-2 border ${validationErrors[fieldName] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              value={formData[fieldName]}
              onChange={handleChange}
            >
              <option value="">Select {label.toLowerCase()}</option>
              {options?.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          ) : (
            <input
              id={fieldName}
              name={fieldName}
              type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
              required={required}
              className={`block w-full pl-10 pr-10 py-2 border ${validationErrors[fieldName] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder={placeholder}
              value={formData[fieldName]}
              onChange={handleChange}
            />
          )}
          {type === 'password' && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          )}
        </div>
        {renderFieldError(fieldName)}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl h-fit">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Create Account
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Join Heart Flow Med with basic details
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Role Selection */}
            {renderField(
              'role',
              'Role',
              'select',
              '',
              UserIcon,
              true,
              [
                { value: 'Patient', label: 'Patient' },
                { value: 'Cardiologist', label: 'Doctor (Cardiologist)' },
                { value: 'Administrative Staff', label: 'Administrative Staff' },
                { value: 'Nurse', label: 'Nurse' },
                { value: 'Sonographer', label: 'Sonographer' }
              ]
            )}

            {/* Basic Information */}
            {renderField('first_name', 'First Name', 'text', 'John', UserIcon, true)}
            {renderField('last_name', 'Last Name', 'text', 'Doe', UserIcon, true)}
            {renderField('email', 'Email Address', 'email', 'you@example.com', EnvelopeIcon, true)}
            {renderField('password', 'Password', 'password', '••••••••', LockClosedIcon, true)}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </a>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <LockClosedIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Enter Verification Code</h3>
              <p className="mt-1 text-sm text-gray-600">
                We've sent a 6-digit code to {formData.email}. Please enter it below.
              </p>
            </div>

            {error && (
              <div className="mt-3 bg-red-50 border-l-4 border-red-500 p-3 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form className="mt-4 space-y-4" onSubmit={handleOTPSubmit}>
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
                  Back to registration
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

            <div className="mt-3 text-center text-sm text-gray-600">
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
    </div>
  );
};

export default Register;
