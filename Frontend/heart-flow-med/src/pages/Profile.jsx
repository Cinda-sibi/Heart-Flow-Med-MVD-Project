import { useState } from 'react';
import useUserProfile from '../hooks/useUserProfile';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, Calendar, MapPin, Shield, Briefcase, Building } from 'lucide-react';
import Layout from '../components/layout/Layout';

const Profile = () => {
  const { profile, loading, error } = useUserProfile();
  const { user } = useAuth();

  if (loading) {
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

  const renderRoleSpecificInfo = () => {
    if (!profile) return null;
    switch (profile.role) {
      case 'Cardiologist':
        return (
          <InfoCard title="Professional Information" icon={Briefcase} color="blue">
            <div className="space-y-4">
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Specialization</p>
                  <p className="font-medium">{profile.specialization}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-medium">{profile.experience} years</p>
                </div>
              </div>
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Consultation Fee</p>
                  <p className="font-medium">${profile.fees}</p>
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
                <p className="font-medium">{profile.department}</p>
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
                <p className="font-medium">{profile.office_location}</p>
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
                  <p className="text-sm text-gray-500">Patient ID</p>
                  <p className="font-medium">{profile.unique_id}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Insurance Provider</p>
                  <p className="font-medium">{profile.insurance_provider || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Insurance ID</p>
                  <p className="font-medium">{profile.insurance_id || 'Not specified'}</p>
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">View and manage your profile information.</p>
        </div>
        {/* Profile Header Card */}
        <div className=" bg-gray-200 p-6 rounded-lg shadow flex items-center text-black space-x-4">
          <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center">
            <User className="h-10 w-10 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black">
              {profile?.first_name} {profile?.last_name}
            </h1>
            <p className="text-black capitalize">{profile?.role}</p>
          </div>
        </div>
        {/* Basic Information Card */}
        <InfoCard title="Basic Information" icon={Mail} color="blue">
          <div className="space-y-4">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{profile?.email}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{profile?.phone || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium">{profile?.date_of_birth || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{profile?.address || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </InfoCard>
        {/* Role Specific Information Card */}
        {renderRoleSpecificInfo()}
      </div>
    </Layout>
  );
};

export default Profile; 