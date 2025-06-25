import React, { useState } from 'react';
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

const ClinicalDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Sample data
  const stats = {
    totalPatients: 1247,
    todaysAppointments: 23,
    availableStaff: 15,
    pendingReferrals: 8,
    bloodTestsToday: 12,
    sonographyBookings: 7
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

  const staff = [
    { id: 1, name: 'Dr. James Smith', role: 'GP', status: 'Available', nextFree: '10:30 AM', specialization: 'General Practice' },
    { id: 2, name: 'Dr. Lisa Johnson', role: 'Cardiologist', status: 'Busy', nextFree: '2:00 PM', specialization: 'Cardiology' },
    { id: 3, name: 'Sarah Wilson', role: 'Sonographer', status: 'Available', nextFree: 'Now', specialization: 'Ultrasound' },
    { id: 4, name: 'Mark Davis', role: 'Blood Tester', status: 'Available', nextFree: '11:00 AM', specialization: 'Pathology' },
    { id: 5, name: 'Dr. Jennifer Brown', role: 'Obstetrician', status: 'Available', nextFree: '1:30 PM', specialization: 'Obstetrics' },
    { id: 6, name: 'Tom Anderson', role: 'Radiologist', status: 'On Break', nextFree: '3:00 PM', specialization: 'Radiology' }
  ];

  const appointments = [
    { id: 1, time: '9:00 AM', patient: 'Sarah Thompson', type: 'Blood Test', provider: 'Mark Davis', status: 'Confirmed' },
    { id: 2, time: '9:30 AM', patient: 'Michael Chen', type: 'GP Consultation', provider: 'Dr. Smith', status: 'Confirmed' },
    { id: 3, time: '10:00 AM', patient: 'Emma Rodriguez', type: 'Ultrasound', provider: 'Sarah Wilson', status: 'Pending' },
    { id: 4, time: '10:30 AM', patient: 'John Parker', type: 'Cardiology', provider: 'Dr. Johnson', status: 'Confirmed' },
    { id: 5, time: '11:00 AM', patient: 'Mary Williams', type: 'Blood Test', provider: 'Mark Davis', status: 'Pending' }
  ];

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const PatientCard = ({ patient, onClick }) => (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(patient)}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{patient.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          patient.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {patient.status}
        </span>
      </div>
      <div className="space-y-1 text-sm text-gray-600">
        <p><span className="font-medium">NHI:</span> {patient.nhi}</p>
        <p><span className="font-medium">Age:</span> {patient.age}</p>
        <p><span className="font-medium">Condition:</span> {patient.condition}</p>
        <p><span className="font-medium">Last Visit:</span> {patient.lastVisit}</p>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Phone className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-600">{patient.phone}</span>
      </div>
    </div>
  );

  const StaffCard = ({ staff }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{staff.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          staff.status === 'Available' ? 'bg-green-100 text-green-800' :
          staff.status === 'Busy' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {staff.status}
        </span>
      </div>
      <div className="space-y-1 text-sm text-gray-600">
        <p><span className="font-medium">Role:</span> {staff.role}</p>
        <p><span className="font-medium">Specialization:</span> {staff.specialization}</p>
        <p><span className="font-medium">Next Available:</span> {staff.nextFree}</p>
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
              <p className="text-sm text-gray-600">New Zealand Healthcare System</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search patients, staff..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="h-4 w-4 inline mr-2" />
                New Patient
              </button>
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
              { id: 'patients', label: 'Patients', icon: Users },
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
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
              <StatCard
                title="Available Staff"
                value={stats.availableStaff}
                icon={UserCheck}
                color="text-purple-600"
                subtitle="On duty"
              />
              <StatCard
                title="Pending Referrals"
                value={stats.pendingReferrals}
                icon={AlertCircle}
                color="text-orange-600"
                subtitle="Needs attention"
              />
              <StatCard
                title="Blood Tests Today"
                value={stats.bloodTestsToday}
                icon={TestTube}
                color="text-red-600"
                subtitle="Scheduled"
              />
              <StatCard
                title="Sonography Bookings"
                value={stats.sonographyBookings}
                icon={Heart}
                color="text-pink-600"
                subtitle="This week"
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Patients Referrals</h3>
                <div className="space-y-3">
                  {patients.slice(0, 3).map(patient => (
                    <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{patient.name}</p>
                        <p className="text-sm text-gray-600">{patient.condition}</p>
                      </div>
                      <span className="text-xs text-gray-500">{patient.lastVisit}</span>
                    </div>
                  ))}
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
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </button>
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="h-4 w-4 inline mr-2" />
                Add Staff
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staff.map(member => (
                <StaffCard key={member.id} staff={member} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Appointment Management</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="h-4 w-4 inline mr-2" />
                New Appointment
              </button>
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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Referral Management</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="h-4 w-4 inline mr-2" />
                New Referral
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {patients.flatMap(patient => 
                patient.referrals.map((referral, index) => (
                  <div key={`${patient.id}-${index}`} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{referral.type}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        referral.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                        referral.status === 'Scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {referral.status}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><span className="font-medium">Patient:</span> {patient.name}</p>
                      <p><span className="font-medium">NHI:</span> {patient.nhi}</p>
                      <p><span className="font-medium">Provider:</span> {referral.provider}</p>
                      <p><span className="font-medium">Date:</span> {referral.date}</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-100 transition-colors">
                        View Details
                      </button>
                      <button className="flex-1 bg-green-50 text-green-700 px-3 py-2 rounded text-sm hover:bg-green-100 transition-colors">
                        Update Status
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Patient Modal */}
      <PatientModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
    </div>
  );
};

export default ClinicalDashboard;