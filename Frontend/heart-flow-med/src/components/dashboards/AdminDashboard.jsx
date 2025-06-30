import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Activity, 
  FileText, 
  UserCheck, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Heart,
  TestTube,
  Stethoscope,
  Eye,
  Phone,
  Mail,
  MapPin,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Download
} from 'lucide-react';
import { 
  getPatientReferrals, 
  updateReferralStatus,
  bookAppointment,
  getAllUsers
} from '../../apis/AdminDashboardApis';
import { useNavigate } from 'react-router-dom';

const ClinicalDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Sample data for other sections
  const stats = {
    totalPatients: 1247,
    todaysAppointments: 23,
    availableStaff: 15,
  };

  const patients = [
    {
      id: 1,
      name: 'Sarah Thompson',
      nhi: 'ABC1234',
      age: 34,
      phone: '+64 21 123 4567',
      email: 'sarah.t@email.com',
      lastVisit: '2025-06-20',
      condition: 'Hypertension',
      status: 'Active',
      referrals: [
        { type: 'Blood Test', date: '2025-06-25', status: 'Scheduled', provider: 'Dr. Smith' },
        { type: 'Cardiology', date: '2025-06-28', status: 'Pending', provider: 'Dr. Johnson' }
      ]
    },
    {
      id: 2,
      name: 'Michael Chen',
      nhi: 'DEF5678',
      age: 45,
      phone: '+64 27 234 5678',
      email: 'mike.chen@email.com',
      lastVisit: '2025-06-18',
      condition: 'Diabetes Type 2',
      status: 'Active',
      referrals: [
        { type: 'Ultrasound', date: '2025-06-26', status: 'Confirmed', provider: 'Dr. Wilson' }
      ]
    },
    {
      id: 3,
      name: 'Emma Rodriguez',
      nhi: 'GHI9012',
      age: 28,
      phone: '+64 22 345 6789',
      email: 'emma.r@email.com',
      lastVisit: '2025-06-22',
      condition: 'Pregnancy - 24 weeks',
      status: 'Active',
      referrals: [
        { type: 'Obstetric Scan', date: '2025-06-27', status: 'Scheduled', provider: 'Dr. Brown' }
      ]
    }
  ];

  // State for users/staff data
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);

  const appointments = [
    { id: 1, time: '9:00 AM', patient: 'Sarah Thompson', type: 'Blood Test', provider: 'Mark Davis', status: 'Confirmed' },
    { id: 2, time: '9:30 AM', patient: 'Michael Chen', type: 'GP Consultation', provider: 'Dr. Smith', status: 'Confirmed' },
    { id: 3, time: '10:00 AM', patient: 'Emma Rodriguez', type: 'Ultrasound', provider: 'Sarah Wilson', status: 'Pending' },
    { id: 4, time: '10:30 AM', patient: 'John Parker', type: 'Cardiology', provider: 'Dr. Johnson', status: 'Confirmed' },
    { id: 5, time: '11:00 AM', patient: 'Mary Williams', type: 'Blood Test', provider: 'Mark Davis', status: 'Pending' }
  ];

  // State for referrals API data
  const [referrals, setReferrals] = useState([]);
  const [referralsLoading, setReferralsLoading] = useState(false);

  // State for referral details modal and appointment booking
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [booking, setBooking] = useState({ date: '', time: '', provider: '' });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        setUsersError(null);
        const response = await getAllUsers();
        setUsers(response.data.data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setUsersError('Failed to load users data. Please try again.');
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Fetch referrals data
  useEffect(() => {
    const fetchReferrals = async () => {
      try {
        setReferralsLoading(true);
        setError(null);
        const response = await getPatientReferrals();
        setReferrals(response.data.data || []);
      } catch (err) {
        console.error('Error fetching referrals:', err);
        setError('Failed to load referrals data. Please try again.');
        setReferrals([]);
      } finally {
        setReferralsLoading(false);
      }
    };

    fetchReferrals();
  }, []);

  // Handle referral status update
  const handleReferralStatusUpdate = async (referralId, newStatus) => {
    try {
      await updateReferralStatus(referralId, newStatus);
      // Refresh referrals data
      const response = await getPatientReferrals();
      setReferrals(response.data.data || []);
    } catch (err) {
      console.error('Error updating referral status:', err);
      alert('Failed to update referral status. Please try again.');
    }
  };

  // Handle opening the referral modal
  const handleViewReferral = (referral) => {
    setSelectedReferral(referral);
    setShowReferralModal(true);
    setBooking({ date: '', time: '', provider: '' });
    setBookingError(null);
    setBookingSuccess(null);
  };

  // Handle booking appointment
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError(null);
    setBookingSuccess(null);
    try {
      // You may need to adjust the payload fields to match your backend
      const payload = {
        referral_id: selectedReferral.id,
        patient_first_name: selectedReferral.patient_first_name,
        patient_last_name: selectedReferral.patient_last_name,
        patient_email: selectedReferral.patient_email,
        patient_phone: selectedReferral.patient_phone,
        date: booking.date,
        time: booking.time,
        provider: booking.provider,
      };
      await bookAppointment(payload);
      setBookingSuccess('Appointment booked successfully!');
    } catch (err) {
      setBookingError('Failed to book appointment. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Helper function to get role display name
  const getRoleDisplayName = (role) => {
    const roleMap = {
      'admin': 'Administrator',
      'gp': 'General Practitioner',
      'doctor': 'Doctor',
      'nurse': 'Nurse',
      'sonographer': 'Sonographer',
      'administrative_staff': 'Administrative Staff',
      'patient': 'Patient'
    };
    return roleMap[role] || role;
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'busy':
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'on break':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
        </div>
        <div className={`p-4 rounded-lg ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </div>
    </div>
  );

  const PatientCard = ({ patient, onClick }) => (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(patient)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-lg">{patient.name}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          patient.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {patient.status}
        </span>
      </div>
      <div className="space-y-2 text-sm text-gray-600">
        <p><span className="font-medium">NHI:</span> {patient.nhi}</p>
        <p><span className="font-medium">Age:</span> {patient.age}</p>
        <p><span className="font-medium">Condition:</span> {patient.condition}</p>
        <p><span className="font-medium">Last Visit:</span> {patient.lastVisit}</p>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Phone className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-600">{patient.phone}</span>
      </div>
    </div>
  );

  const StaffCard = ({ user }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-lg">
          {user.first_name} {user.last_name}
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
          {user.status || 'Active'}
        </span>
      </div>
      <div className="space-y-2 text-sm text-gray-600">
        <p><span className="font-medium">Role:</span> {getRoleDisplayName(user.role)}</p>
        <p><span className="font-medium">Email:</span> {user.email}</p>
        {user.phone && (
          <p><span className="font-medium">Phone:</span> {user.phone}</p>
        )}
        {user.department && (
          <p><span className="font-medium">Department:</span> {user.department}</p>
        )}
        {user.specialization && (
          <p><span className="font-medium">Specialization:</span> {user.specialization}</p>
        )}
        <p><span className="font-medium">Joined:</span> {new Date(user.date_joined).toLocaleDateString()}</p>
      </div>
      <div className="flex gap-2 mt-4">
        {/* <button className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-100 transition-colors">
          <Edit className="h-4 w-4 inline mr-1" />
          Edit
        </button>
        <button className="flex-1 bg-red-50 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-100 transition-colors">
          <Trash2 className="h-4 w-4 inline mr-1" />
          Remove
        </button> */}
      </div>
    </div>
  );

  const PatientModal = ({ patient, onClose }) => {
    if (!patient) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Patient Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XCircle className="h-6 w-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {patient.name}</p>
                <p><span className="font-medium">NHI:</span> {patient.nhi}</p>
                <p><span className="font-medium">Age:</span> {patient.age}</p>
                <p><span className="font-medium">Phone:</span> {patient.phone}</p>
                <p><span className="font-medium">Email:</span> {patient.email}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Medical Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Condition:</span> {patient.condition}</p>
                <p><span className="font-medium">Status:</span> {patient.status}</p>
                <p><span className="font-medium">Last Visit:</span> {patient.lastVisit}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Referrals</h3>
            <div className="space-y-2">
              {patient.referrals.map((referral, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{referral.type}</p>
                      <p className="text-sm text-gray-600">Provider: {referral.provider}</p>
                      <p className="text-sm text-gray-600">Date: {referral.date}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      referral.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      referral.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {referral.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Edit className="h-4 w-4 inline mr-2" />
              Edit Patient
            </button>
            <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              <Plus className="h-4 w-4 inline mr-2" />
              New Referral
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Clinical Management Dashboard</h1>
              {/* <p className="text-sm text-gray-600">New Zealand Healthcare System</p> */}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              // { id: 'patients', label: 'Patients', icon: Users },
              { id: 'staff', label: 'Staff Management', icon: UserCheck },
              { id: 'appointments', label: 'Appointments', icon: Calendar },
              { id: 'referrals', label: 'Referrals', icon: FileText }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                title="Total Patients"
                value={stats.totalPatients}
                icon={Users}
                color="text-blue-600"
                subtitle="Active records"
              />
              <StatCard
                title="Today's Appointments"
                value={stats.todaysAppointments}
                icon={Calendar}
                color="text-green-600"
                subtitle="Scheduled"
              />
              {/* <StatCard
                title="Available Staff"
                value={stats.availableStaff}
                icon={UserCheck}
                color="text-purple-600"
                subtitle="On duty"
              /> */}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Patients Referrals</h3>
                <div className="space-y-3">
                  {referrals.slice(0, 3).map(referral => (
                    <div key={referral.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{referral.patient_first_name} {referral.patient_last_name}</p>
                        <p className="text-sm text-gray-600">{referral.reason}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{new Date(referral.referred_at).toLocaleDateString()}</span>
                        <button
                          className="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
                          onClick={() => handleViewReferral(referral)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                  {referrals.length === 0 && (
                    <div className="text-gray-500 text-sm">No recent referrals found.</div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
                <div className="space-y-3">
                  {appointments.slice(0, 3).map(appointment => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{appointment.time}</p>
                        <p className="text-sm text-gray-600">{appointment.patient} - {appointment.type}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Patient Management</h2>
              <div className="flex gap-2">
                {/* <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </button>
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button> */}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {patients.map(patient => (
                <PatientCard key={patient.id} patient={patient} onClick={setSelectedPatient} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Staff Management</h2>
              {/* <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="h-4 w-4 inline mr-2" />
                Add Staff
              </button> */}
            </div>
            
            {usersLoading ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading staff members...</p>
              </div>
            ) : usersError ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{usersError}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : users.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Staff Members Found</h3>
                <p className="text-gray-600">There are currently no staff members to display.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {users
                  .filter(user => user.role !== 'patient') // Filter out patients, show only staff
                  .map(user => (
                    <StaffCard key={user.id} user={user} />
                  ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Appointment Management</h2>
              {/* <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="h-4 w-4 inline mr-2" />
                New Appointment
              </button> */}
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map(appointment => (
                      <tr key={appointment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{appointment.time}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.patient}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{appointment.provider}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'referrals' && (
          <div className="space-y-6">
            {console.log('Current referrals state:', referrals)}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Referral Management</h2>
              {/* <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="h-4 w-4 inline mr-2" />
                New Referral
              </button> */}
            </div>
            
            {referralsLoading ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading referrals...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : referrals.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Referrals Found</h3>
                <p className="text-gray-600">There are currently no referrals to display.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {referrals.map((referral) => (
                  <div key={referral.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {referral.reason || 'Medical Referral'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        referral.status === 'Ongoing' ? 'bg-blue-100 text-blue-800' :
                        referral.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        referral.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {referral.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Patient:</span> {referral.patient_first_name} {referral.patient_last_name}</p>
                      <p><span className="font-medium">Email:</span> {referral.patient_email}</p>
                      <p><span className="font-medium">Phone:</span> {referral.patient_phone}</p>
                      <p><span className="font-medium">Age:</span> {referral.age}</p>
                      {referral.gender && (
                        <p><span className="font-medium">Gender:</span> {referral.gender}</p>
                      )}
                      <p><span className="font-medium">Referred By:</span> {referral.referred_by_name}</p>
                      <p><span className="font-medium">Date:</span> {new Date(referral.referred_at).toLocaleDateString()}</p>
                      {referral.symptoms && (
                        <p><span className="font-medium">Symptoms:</span> {referral.symptoms}</p>
                      )}
                      {referral.medical_reference_no && (
                        <p><span className="font-medium">Reference No:</span> {referral.medical_reference_no}</p>
                      )}
                      {referral.doctor_notes && (
                        <p><span className="font-medium">Doctor Notes:</span> {referral.doctor_notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-100 transition-colors">
                        View Details
                      </button>
                      <button 
                        className="flex-1 bg-green-50 text-green-700 px-3 py-2 rounded text-sm hover:bg-green-100 transition-colors"
                        onClick={() => {
                          const newStatus = referral.status === 'Ongoing' ? 'Completed' : 
                                           referral.status === 'Completed' ? 'Ongoing' : 'Ongoing';
                          handleReferralStatusUpdate(referral.id, newStatus);
                        }}
                      >
                        Update Status
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Patient Modal */}
      <PatientModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />

      {/* Referral Details Modal */}
      {showReferralModal && selectedReferral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setShowReferralModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <XCircle className="h-6 w-6" />
            </button>
            <div className="flex flex-col items-center mb-6">
              <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <UserCheck className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Referral Details</h2>
            </div>
            <div className="space-y-3 text-base text-gray-700 mb-6">
              <div><span className="font-semibold">Patient:</span> {selectedReferral.patient_first_name} {selectedReferral.patient_last_name}</div>
              <div><span className="font-semibold">Email:</span> <span className="text-blue-700">{selectedReferral.patient_email}</span></div>
              <div><span className="font-semibold">Phone:</span> {selectedReferral.patient_phone}</div>
              <div className="flex gap-4">
                <div><span className="font-semibold">Age:</span> {selectedReferral.age}</div>
                {selectedReferral.gender && (
                  <div><span className="font-semibold">Gender:</span> {selectedReferral.gender}</div>
                )}
              </div>
              <div><span className="font-semibold">Referred By:</span> {selectedReferral.referred_by_name}</div>
              <div><span className="font-semibold">Date:</span> {new Date(selectedReferral.referred_at).toLocaleDateString()}</div>
              {selectedReferral.symptoms && (
                <div><span className="font-semibold">Symptoms:</span> {selectedReferral.symptoms}</div>
              )}
              {selectedReferral.medical_reference_no && (
                <div><span className="font-semibold">Reference No:</span> {selectedReferral.medical_reference_no}</div>
              )}
              {selectedReferral.doctor_notes && (
                <div className="bg-blue-50 rounded p-3 mt-2">
                  <span className="font-semibold">Doctor Notes:</span> <span className="text-gray-800">{selectedReferral.doctor_notes}</span>
                </div>
              )}
            </div>
            <hr className="my-4" />
            <button
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors text-lg font-semibold shadow"
              onClick={() => navigate('/book-appointments', { state: { referral: selectedReferral } })}
            >
              Book Appointment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicalDashboard;