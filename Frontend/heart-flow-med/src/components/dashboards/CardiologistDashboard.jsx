import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Heart, 
  FileText, 
  TrendingUp, 
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { fetchAllPatients } from '../../apis/DoctorDashboardApis';

const CardiologistDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingResults: 0,
    urgentCases: 0
  });

  const [recentPatients, setRecentPatients] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  useEffect(() => {
    // Fetch dashboard data
    fetchDashboardData();
    fetchRecentPatients();
  }, []);

  const fetchDashboardData = async () => {
    // Mock data - replace with actual API calls
    setStats({
      totalPatients: 347,
      todayAppointments: 12,
      pendingResults: 8,
      urgentCases: 3
    });

    setUpcomingAppointments([
      { id: 1, time: '09:00', patient: 'Sarah Wilson', type: 'Follow-up', status: 'confirmed' },
      { id: 2, time: '10:30', patient: 'Michael Davis', type: 'Consultation', status: 'pending' },
      { id: 3, time: '14:00', patient: 'Lisa Anderson', type: 'ECG Review', status: 'confirmed' },
    ]);
  };

  // Fetch recent patients from API
  const fetchRecentPatients = async () => {
    try {
      const response = await fetchAllPatients();
      // response.data is the array of patients
      const patients = (response.data || []).map((p) => ({
        id: p.id,
        name: p.user.first_name + ' ' + p.user.last_name,
        age: p.date_of_birth ? new Date().getFullYear() - new Date(p.date_of_birth).getFullYear() : '',
        condition: p.insurance_provider || 'N/A', // You can adjust this to another field if needed
        lastVisit: p.last_visit || '', // If you have a last visit field, otherwise leave blank
      }));
      setRecentPatients(patients);
    } catch (error) {
      setRecentPatients([]);
      // Optionally handle error (e.g., show notification)
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cardiologist Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your overview for today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          icon={Calendar}
          color="green"
        />
        <StatCard
          title="Pending Results"
          value={stats.pendingResults}
          icon={FileText}
          color="yellow"
        />
        <StatCard
          title="Urgent Cases"
          value={stats.urgentCases}
          icon={AlertCircle}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Patients</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{patient.name}</h3>
                    <p className="text-sm text-gray-600">Age: {patient.age} • {patient.condition}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Last visit</p>
                    <p className="text-sm font-medium text-gray-900">{patient.lastVisit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's Appointments */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Today's Appointments</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{appointment.patient}</h3>
                      <p className="text-sm text-gray-600">{appointment.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      appointment.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status === 'confirmed' ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <Heart className="h-6 w-6 text-blue-600 mr-2" />
            <span className="font-medium text-blue-900">Review ECG Results</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <FileText className="h-6 w-6 text-green-600 mr-2" />
            <span className="font-medium text-green-900">Create Prescription</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <TrendingUp className="h-6 w-6 text-purple-600 mr-2" />
            <span className="font-medium text-purple-900">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardiologistDashboard;