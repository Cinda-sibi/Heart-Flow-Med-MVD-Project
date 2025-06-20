import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LockClosedIcon, EnvelopeIcon, UserIcon, PhoneIcon, CalendarIcon, MapPinIcon, MapIcon, AcademicCapIcon, BriefcaseIcon, ClockIcon, CurrencyDollarIcon, BuildingOfficeIcon, IdentificationIcon } from '@heroicons/react/24/outline';
import axiosInstance from '../../config/axiosInstance';
import TokenService from '../../config/tokenService';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    role: 'Patient', // Default role
    // Common fields
    date_of_birth: '',
    gender: '',
    address: '',
    emergency_contact: '',
    // Patient specific fields
    age: '',
    insurance_provider: '',
    insurance_id: '',
    country: '',
    // Doctor specific fields
    specialization: '',
    experience: '',
    availability: '',
    fees: '',
    // Administrative Staff specific fields
    department: '',
    job_title: '',
    shift: '',
    working_hours: '',
    extension_number: '',
    office_location: '',
    // Nurse specific fields
    // Sonographer specific fields
    certification: '',
  });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [registrationData, setRegistrationData] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Role configurations
  const roleConfigs = {
    'Patient': {
      requiredFields: ['first_name', 'last_name', 'email', 'password', 'phone', 'date_of_birth', 'gender', 'address', 'emergency_contact', 'age'],
      optionalFields: ['insurance_provider', 'insurance_id', 'country'],
      title: 'Patient Registration',
      description: 'Join Heart Flow Med as a patient'
    },
    'Cardiologist': {
      requiredFields: ['first_name', 'last_name', 'email', 'password', 'phone', 'date_of_birth', 'gender', 'address', 'emergency_contact'],
      optionalFields: ['specialization', 'experience', 'availability', 'fees'],
      title: 'Doctor Registration',
      description: 'Join Heart Flow Med as a cardiologist'
    },
    'Administrative Staff': {
      requiredFields: ['first_name', 'last_name', 'email', 'password', 'phone'],
      optionalFields: ['gender', 'address', 'department', 'job_title', 'shift', 'working_hours', 'extension_number', 'office_location', 'age'],
      title: 'Administrative Staff Registration',
      description: 'Join Heart Flow Med as administrative staff'
    },
    'Nurse': {
      requiredFields: ['first_name', 'last_name', 'email', 'password', 'phone', 'department', 'shift'],
      optionalFields: [],
      title: 'Nurse Registration',
      description: 'Join Heart Flow Med as a nurse'
    },
    'Sonographer': {
      requiredFields: ['first_name', 'last_name', 'email', 'password', 'phone', 'certification'],
      optionalFields: [],
      title: 'Sonographer Registration',
      description: 'Join Heart Flow Med as a sonographer'
    }
  };

  const currentRoleConfig = roleConfigs[formData.role];

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setValidationErrors({});
    setIsLoading(true);

    try {
      // Prepare data based on role
      const requestData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
      };

      // Add role-specific fields
      if (formData.role === 'Patient') {
        Object.assign(requestData, {
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          address: formData.address,
          emergency_contact: formData.emergency_contact,
          age: formData.age,
          insurance_provider: formData.insurance_provider,
          insurance_id: formData.insurance_id,
          country: formData.country,
        });
      } else if (formData.role === 'Cardiologist') {
        Object.assign(requestData, {
          date_of_birth: formData.date_of_birth,
          gender: formData.gender,
          address: formData.address,
          emergency_contact: formData.emergency_contact,
          specialization: formData.specialization,
          experience: formData.experience,
          availability: formData.availability,
          fees: formData.fees,
        });
      } else if (formData.role === 'Administrative Staff') {
        Object.assign(requestData, {
          gender: formData.gender,
          address: formData.address,
          department: formData.department,
          job_title: formData.job_title,
          shift: formData.shift,
          working_hours: formData.working_hours,
          extension_number: formData.extension_number,
          office_location: formData.office_location,
          age: formData.age,
        });
      } else if (formData.role === 'Nurse') {
        Object.assign(requestData, {
          department: formData.department,
          shift: formData.shift,
        });
      } else if (formData.role === 'Sonographer') {
        Object.assign(requestData, {
          certification: formData.certification,
        });
      }

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
          ) : type === 'textarea' ? (
            <textarea
              id={fieldName}
              name={fieldName}
              required={required}
              rows="2"
              className={`block w-full pl-10 pr-3 py-2 border ${validationErrors[fieldName] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder={placeholder}
              value={formData[fieldName]}
              onChange={handleChange}
            />
          ) : (
            <input
              id={fieldName}
              name={fieldName}
              type={type}
              required={required}
              className={`block w-full pl-10 pr-3 py-2 border ${validationErrors[fieldName] ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder={placeholder}
              value={formData[fieldName]}
              onChange={handleChange}
            />
          )}
        </div>
        {renderFieldError(fieldName)}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              {currentRoleConfig.title}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {currentRoleConfig.description}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
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

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Role Selection */}
            <div className="mb-6">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information - Always shown */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Basic Information</h3>
              </div>

              {renderField('first_name', 'First Name', 'text', 'John', UserIcon, true)}
              {renderField('last_name', 'Last Name', 'text', 'Doe', UserIcon, true)}
              {renderField('email', 'Email Address', 'email', 'you@example.com', EnvelopeIcon, true)}
              {renderField('phone', 'Phone Number', 'tel', '+1234567890', PhoneIcon, true)}
              {renderField('password', 'Password', 'password', '••••••••', LockClosedIcon, true)}

              {/* Role-specific fields */}
              {(formData.role === 'Patient' || formData.role === 'Cardiologist') && (
                <>
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Personal Information</h3>
                  </div>
                  {renderField('date_of_birth', 'Date of Birth', 'date', '', CalendarIcon, true)}
                  {renderField('gender', 'Gender', 'select', '', UserIcon, true, [
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' }
                  ])}
                  {renderField('emergency_contact', 'Emergency Contact', 'tel', '+1234567890', PhoneIcon, true)}
                  {renderField('address', 'Address', 'textarea', 'Enter your full address', MapPinIcon, true)}
                </>
              )}

              {/* Patient-specific fields */}
              {formData.role === 'Patient' && (
                <>
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Patient Information</h3>
                  </div>
                  {renderField('age', 'Age', 'number', '25', UserIcon, true)}
                  {renderField('insurance_provider', 'Insurance Provider', 'text', 'Provider Name', BriefcaseIcon, false)}
                  {renderField('insurance_id', 'Insurance ID', 'text', 'ID Number', IdentificationIcon, false)}
                  {renderField('country', 'Country', 'text', 'Country', MapIcon, false)}
                </>
              )}

              {/* Doctor-specific fields */}
              {formData.role === 'Cardiologist' && (
                <>
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Professional Information</h3>
                  </div>
                  {renderField('specialization', 'Specialization', 'text', 'Cardiology', AcademicCapIcon, false)}
                  {renderField('experience', 'Years of Experience', 'number', '5', BriefcaseIcon, false)}
                  {renderField('availability', 'Availability', 'text', 'Mon-Fri 9AM-5PM', ClockIcon, false)}
                  {renderField('fees', 'Consultation Fees', 'number', '100.00', CurrencyDollarIcon, false)}
                </>
              )}

              {/* Administrative Staff-specific fields */}
              {formData.role === 'Administrative Staff' && (
                <>
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Staff Information</h3>
                  </div>
                  {renderField('gender', 'Gender', 'select', '', UserIcon, false, [
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' }
                  ])}
                  {renderField('age', 'Age', 'number', '25', UserIcon, false)}
                  {renderField('address', 'Address', 'textarea', 'Enter your address', MapPinIcon, false)}
                  {renderField('department', 'Department', 'text', 'Cardiology', BuildingOfficeIcon, false)}
                  {renderField('job_title', 'Job Title', 'text', 'Front Office Staff', BriefcaseIcon, false)}
                  {renderField('shift', 'Shift', 'select', '', ClockIcon, false, [
                    { value: 'Morning', label: 'Morning' },
                    { value: 'Evening', label: 'Evening' },
                    { value: 'Night', label: 'Night' }
                  ])}
                  {renderField('working_hours', 'Working Hours', 'text', '9:00 AM - 5:00 PM', ClockIcon, false)}
                  {renderField('extension_number', 'Extension Number', 'text', '123', PhoneIcon, false)}
                  {renderField('office_location', 'Office Location', 'text', 'Building A, Floor 2', MapPinIcon, false)}
                </>
              )}

              {/* Nurse-specific fields */}
              {formData.role === 'Nurse' && (
                <>
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Nursing Information</h3>
                  </div>
                  {renderField('department', 'Department', 'text', 'Cardiology', BuildingOfficeIcon, true)}
                  {renderField('shift', 'Shift', 'select', '', ClockIcon, true, [
                    { value: 'Morning', label: 'Morning' },
                    { value: 'Evening', label: 'Evening' },
                    { value: 'Night', label: 'Night' }
                  ])}
                </>
              )}

              {/* Sonographer-specific fields */}
              {formData.role === 'Sonographer' && (
                <>
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Professional Information</h3>
                  </div>
                  {renderField('certification', 'Certification', 'text', 'ARDMS, CCI, etc.', AcademicCapIcon, true)}
                </>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
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

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </a>
          </div>
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
                We've sent a 6-digit code to {formData.email}. Please enter it below.
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
    </div>
  );
};

export default Register;
