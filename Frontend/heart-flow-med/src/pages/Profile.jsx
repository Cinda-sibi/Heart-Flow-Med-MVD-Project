import React, { useState } from 'react';
import useUserProfile from '../hooks/useUserProfile';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, Calendar, MapPin, Shield, Briefcase, Building } from 'lucide-react';
import Layout from '../components/layout/Layout';

const Profile = () => {
  const { profile, loading, error, updateProfile } = useUserProfile();
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(null);
  const [success, setSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [saving, setSaving] = useState(false);

  // Initialize form state when profile loads
  React.useEffect(() => {
    if (profile) {
      setForm({ ...profile });
    }
  }, [profile]);

  if (loading || !form) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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

  const InfoCard = ({ title, children, icon: Icon, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        {Icon && (
          <div className={`p-2 rounded-lg bg-${color}-100 mr-3`}>
            <Icon className={`h-5 w-5 text-${color}-600`} />
          </div>
        )}
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleSpecificChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setEditMode(true);
    setSuccess('');
    setUpdateError('');
  };

  const handleCancel = () => {
    setEditMode(false);
    setForm({ ...profile });
    setSuccess('');
    setUpdateError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setUpdateError('');
    setSuccess('');
    try {
      // Only send fields that are editable
      const payload = { ...form };
      const response = await updateProfile(payload);
      if (response.status) {
        setSuccess('Profile updated successfully!');
        setEditMode(false);
      } else {
        setUpdateError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const renderRoleSpecificInfo = () => {
    if (!form) return null;
    switch (form.role) {
      case 'Cardiologist':
        return (
          <InfoCard title="Professional Information" icon={Briefcase} color="blue">
            <div className="space-y-4">
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Specialization</p>
                  {editMode ? (
                    <input
                      type="text"
                      name="specialization"
                      value={form.specialization || ''}
                      onChange={handleRoleSpecificChange}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <p className="font-medium">{form.specialization}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  {editMode ? (
                    <input
                      type="number"
                      name="experience"
                      value={form.experience || ''}
                      onChange={handleRoleSpecificChange}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <p className="font-medium">{form.experience} years</p>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Consultation Fee</p>
                  {editMode ? (
                    <input
                      type="number"
                      name="fees"
                      value={form.fees || ''}
                      onChange={handleRoleSpecificChange}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <p className="font-medium">${form.fees}</p>
                  )}
                </div>
              </div>
            </div>
          </InfoCard>
        );
      case 'Nurse':
        return (
          <InfoCard title="Professional Information" icon={Building} color="green">
            <div className="flex items-center">
              <Building className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Department</p>
                {editMode ? (
                  <input
                    type="text"
                    name="department"
                    value={form.department || ''}
                    onChange={handleRoleSpecificChange}
                    className="border rounded px-2 py-1 w-full"
                  />
                ) : (
                  <p className="font-medium">{form.department}</p>
                )}
              </div>
            </div>
          </InfoCard>
        );
      case 'Administrative Staff':
        return (
          <InfoCard title="Work Information" icon={Building} color="yellow">
            <div className="flex items-center">
              <Building className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Office Location</p>
                {editMode ? (
                  <input
                    type="text"
                    name="office_location"
                    value={form.office_location || ''}
                    onChange={handleRoleSpecificChange}
                    className="border rounded px-2 py-1 w-full"
                  />
                ) : (
                  <p className="font-medium">{form.office_location}</p>
                )}
              </div>
            </div>
          </InfoCard>
        );
      case 'Patient':
        return (
          <InfoCard title="Medical Information" icon={Shield} color="purple">
            <div className="space-y-4">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Patient MRI No.</p>
                  <p className="font-medium">{form.unique_id}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Insurance Provider</p>
                  {editMode ? (
                    <input
                      type="text"
                      name="insurance_provider"
                      value={form.insurance_provider || ''}
                      onChange={handleRoleSpecificChange}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <p className="font-medium">{form.insurance_provider || 'Not specified'}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Insurance ID</p>
                  {editMode ? (
                    <input
                      type="text"
                      name="insurance_id"
                      value={form.insurance_id || ''}
                      onChange={handleRoleSpecificChange}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <p className="font-medium">{form.insurance_id || 'Not specified'}</p>
                  )}
                </div>
              </div>
            </div>
          </InfoCard>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">View and manage your profile information.</p>
          </div>
          {!editMode && (
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleEdit}
            >
              Edit
            </button>
          )}
        </div>
        {/* Profile Header Card */}
        <div className=" bg-gray-200 p-6 rounded-lg shadow flex items-center text-black space-x-4">
          <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center">
            <User className="h-10 w-10 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black">
              {form?.first_name} {form?.last_name}
            </h1>
            <p className="text-black capitalize">{form?.role}</p>
          </div>
        </div>
        {/* Basic Information Card */}
        <form onSubmit={handleSave}>
          <InfoCard title="Basic Information" icon={Mail} color="blue">
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  {editMode ? (
                    <input
                      type="email"
                      name="email"
                      value={form.email || ''}
                      onChange={handleChange}
                      className="border rounded px-2 py-1 w-full"
                      required
                    />
                  ) : (
                    <p className="font-medium">{form?.email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  {editMode ? (
                    <input
                      type="text"
                      name="phone"
                      value={form.phone || ''}
                      onChange={handleChange}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <p className="font-medium">{form?.phone || 'Not specified'}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  {editMode ? (
                    <input
                      type="date"
                      name="date_of_birth"
                      value={form.date_of_birth || ''}
                      onChange={handleChange}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <p className="font-medium">{form?.date_of_birth || 'Not specified'}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  {editMode ? (
                    <input
                      type="text"
                      name="address"
                      value={form.address || ''}
                      onChange={handleChange}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <p className="font-medium">{form?.address || 'Not specified'}</p>
                  )}
                </div>
              </div>
            </div>
          </InfoCard>
          {/* Role Specific Information Card */}
          {renderRoleSpecificInfo()}
          {editMode && (
            <div className="flex space-x-2 mt-4">
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
          {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
          {updateError && <div className="text-red-600 text-sm mt-2">{updateError}</div>}
        </form>
      </div>
    </Layout>
  );
};

export default Profile; 