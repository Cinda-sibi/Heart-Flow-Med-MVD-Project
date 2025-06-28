import React from 'react';
import useUserProfile from '../hooks/useUserProfile';
import { useAuth } from '../contexts/AuthContext';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  Briefcase,
  Building,
} from 'lucide-react';
import Layout from '../components/layout/Layout';

// Simple input component without memoization
const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required = false,
  icon: Icon,
  disabled,
}) => (
  <div className="flex items-center">
    {Icon && <Icon className="h-5 w-5 text-gray-400 mr-3" />}
    <div className="flex-1">
      <p className="text-sm text-gray-500">{label}</p>
      <div className="mt-1">
        {disabled ? (
          <p className="text-gray-900 py-2 px-3 bg-gray-50 rounded-md border border-gray-200">
            {value ? (
              type === 'date' ? (
                new Date(value).toLocaleDateString()
              ) : type === 'number' && name === 'fees' ? (
                `$${value}`
              ) : (
                value
              )
            ) : (
              <span className="text-gray-500 italic">Not specified</span>
            )}
          </p>
        ) : (
          <input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required={required}
            autoComplete="off"
          />
        )}
      </div>
    </div>
  </div>
);

const InfoCard = ({ title, children, icon: Icon, color = 'blue' }) => (
  <div className="bg-white rounded-lg shadow p-6 mb-6">
    <div className="flex items-center mb-4">
      {Icon && (
        <div className={`p-2 rounded-lg bg-${color}-100 mr-3`}>
          <Icon className={`h-5 w-5 text-${color}-600`} />
        </div>
      )}
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    </div>
    <div className="space-y-4">{children}</div>
  </div>
);

const Profile = () => {
  const { profile, loading, error, updateProfile } = useUserProfile();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState(null);
  const [status, setStatus] = React.useState({ message: '', type: '' });
  const [isSaving, setIsSaving] = React.useState(false);
  const [imageFile, setImageFile] = React.useState(null);
  const [imagePreview, setImagePreview] = React.useState(null);

  // Initialize form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        role: profile.role || '',
        date_of_birth: profile.profile?.date_of_birth || '',
        address: profile.profile?.address || '',
        specialization: profile.profile?.specialization || '',
        experience: profile.profile?.experience || '',
        fees: profile.profile?.fees || '',
        department: profile.profile?.department || '',
        office_location: profile.profile?.office_location || '',
        insurance_provider: profile.profile?.insurance_provider || '',
        insurance_id: profile.profile?.insurance_id || '',
        unique_id: profile.profile?.unique_id || '',
        user_images: profile.user_images || null,
        // Add other fields as needed
      });
      setImagePreview(profile.user_images || null);
      setImageFile(null);
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setStatus({ message: '', type: '' });

    try {
      let payload;
      if (imageFile) {
        payload = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (key !== 'profile') payload.append(key, value);
        });
        if (formData.profile) {
          Object.entries(formData.profile).forEach(([key, value]) => {
            payload.append(key, value);
          });
        }
        payload.append('user_images', imageFile);
      } else {
        payload = {
          ...formData,
          profile: {
            date_of_birth: formData.date_of_birth,
            address: formData.address,
            specialization: formData.specialization,
            experience: formData.experience,
            fees: formData.fees,
            department: formData.department,
            office_location: formData.office_location,
            insurance_provider: formData.insurance_provider,
            insurance_id: formData.insurance_id,
          },
        };
      }

      const response = await updateProfile(payload);
      if (response.status) {
        setStatus({
          message: 'Profile updated successfully!',
          type: 'success',
        });
        setIsEditing(false);
        setImageFile(null);
      } else {
        setStatus({
          message: response.message || 'Update failed',
          type: 'error',
        });
      }
    } catch (err) {
      setStatus({
        message: err.response?.data?.message || 'Failed to update profile',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      role: profile.role || '',
      date_of_birth: profile.profile?.date_of_birth || '',
      address: profile.profile?.address || '',
      specialization: profile.profile?.specialization || '',
      experience: profile.profile?.experience || '',
      fees: profile.profile?.fees || '',
      department: profile.profile?.department || '',
      office_location: profile.profile?.office_location || '',
      insurance_provider: profile.profile?.insurance_provider || '',
      insurance_id: profile.profile?.insurance_id || '',
      unique_id: profile.profile?.unique_id || '',
      user_images: profile.user_images || null,
    });
    setImagePreview(profile.user_images || null);
    setImageFile(null);
    setStatus({ message: '', type: '' });
  };

  if (loading || !formData) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  const renderRoleSpecificFields = () => {
    switch (formData.role) {
      case 'Cardiologist':
        return (
          <InfoCard
            title="Professional Information"
            icon={Briefcase}
            color="blue"
          >
            <FormInput
              label="Specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleInputChange}
              icon={Briefcase}
              disabled={!isEditing}
            />
            <FormInput
              label="Experience (years)"
              name="experience"
              type="number"
              value={formData.experience}
              onChange={handleInputChange}
              icon={Calendar}
              disabled={!isEditing}
            />
            <FormInput
              label="Consultation Fee"
              name="fees"
              type="number"
              value={formData.fees}
              onChange={handleInputChange}
              icon={Shield}
              disabled={!isEditing}
            />
          </InfoCard>
        );
      case 'Nurse':
        return (
          <InfoCard
            title="Department Information"
            icon={Building}
            color="green"
          >
            <FormInput
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              icon={Building}
              disabled={!isEditing}
            />
          </InfoCard>
        );
      case 'Administrative Staff':
        return (
          <InfoCard title="Work Information" icon={Building} color="yellow">
            <FormInput
              label="Office Location"
              name="office_location"
              value={formData.office_location}
              onChange={handleInputChange}
              icon={Building}
              disabled={!isEditing}
            />
          </InfoCard>
        );
      case 'Patient':
        return (
          <InfoCard title="Medical Information" icon={Shield} color="purple">
            <div className="flex items-center mb-4">
              <Shield className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Patient Unique ID.</p>
                <p className="text-gray-900 py-2">
                  {formData.unique_id || 'Not specified'}
                </p>
              </div>
            </div>
            <FormInput
              label="MRI No"
              name="medical_reference_no"
              value={formData.medical_reference_no}
              onChange={handleInputChange}
              icon={Shield}
              disabled={!isEditing}
            />
            <FormInput
              label="Age"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              icon={Shield}
              disabled={!isEditing}
            />
            <FormInput
              label="Insurance Provider"
              name="insurance_provider"
              value={formData.insurance_provider}
              onChange={handleInputChange}
              icon={Shield}
              disabled={!isEditing}
            />
            <FormInput
              label="Insurance ID"
              name="insurance_id"
              value={formData.insurance_id}
              onChange={handleInputChange}
              icon={Shield}
              disabled={!isEditing}
            />
          </InfoCard>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="bg-gray-100 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <div className="h-20 w-20 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden">
              {imagePreview ? (
                <img
                  src={imagePreview.startsWith('http') ? imagePreview : `${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}/${imagePreview}`}
                  alt="Profile"
                  className="h-20 w-20 object-cover rounded-full"
                />
              ) : (
                <User className="h-10 w-10 text-white" />
              )}
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {formData.first_name} {formData.last_name}
              </h2>
              <p className="text-gray-600 capitalize">{formData.role}</p>
            </div>
          </div>
          {isEditing && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {imageFile && (
                <p className="text-xs text-gray-500 mt-1">Selected: {imageFile.name}</p>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <InfoCard title="Basic Information" icon={Mail} color="blue">
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              icon={Mail}
              required
              disabled={!isEditing}
            />
            <FormInput
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              icon={Phone}
              disabled={!isEditing}
            />
            <FormInput
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={handleInputChange}
              icon={Calendar}
              disabled={!isEditing}
            />
            <FormInput
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              icon={MapPin}
              disabled={!isEditing}
            />
          </InfoCard>

          {renderRoleSpecificFields()}

          {isEditing && (
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {status.message && (
            <div
              className={`p-4 rounded-md ${
                status.type === 'success'
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              {status.message}
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
};

export default Profile;
