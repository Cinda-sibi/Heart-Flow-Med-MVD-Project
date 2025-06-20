import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Phone, 
  Clock, 
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  UserPlus,
  FileText,
  MapPin,
  Bell
} from 'lucide-react';

const ReceptionistDashboard = () => {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    checkedInPatients: 0,
    waitingPatients: 0,
    cancelledAppointments: 0
  });

  const [todaySchedule, setTodaySchedule] = useState([]);
  const [waitingQueue, setWaitingQueue] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Mock data - replace with actual API calls
    setStats({
      todayAppointments: 24,
      checkedInPatients: 15,
      waitingPatients: 6,
      cancelledAppointments: 2
    });

    setTodaySchedule([
      { 
        id: 1, 
        time: '09:00', 
        patient: 'John Smith', 
        doctor: 'Dr. Sarah Johnson', 
        type: 'Consultation', 
        status: 'checked-in',
        phone: '(555) 123-4567'
      },
      { 
        id: 2, 
        time: '09:30', 
        patient: 'Mary Wilson', 
        doctor: 'Dr. Michael Chen', 
        type: 'Follow-up', 
        status: 'waiting',
        phone: '(555) 234-5678'
      },
      { 
        id: 3, 
        time: '10:00', 
        patient: 'Robert Brown', 
        doctor: 'Dr. Sarah Johnson', 
        type: 'ECG Test', 
        status: 'scheduled',
        phone: '(555) 345-6789'
      },
      { 
        id: 4, 
        time: '10:30', 
        patient: 'Lisa Anderson', 
        doctor: 'Dr. Emily Davis', 
        type: 'Routine Check', 
        status: 'confirmed',
        phone: '(555) 456-7890'
      }
    ]);

    setWaitingQueue([
      { id: 1, name: 'John Smith', doctor: 'Dr. Sarah Johnson', waitTime: '15 min', priority: 'normal' },
      { id: 2, name: 'Mary Wilson', doctor: 'Dr. Michael Chen', waitTime: '8 min', priority: 'normal' },
      { id: 3, name: 'David Miller', doctor: 'Dr. Emily Davis', waitTime: '22 min', priority: 'urgent' },
      { id: 4, name: 'Susan Taylor', doctor: 'Dr. Sarah Johnson', waitTime: '5 min', priority: 'normal' }
    ]);

    setRecentActivities([
      { id: 1, action: 'Patient checked in', details: 'John Smith - 09:00 appointment', time: '5 min ago' },
      { id: 2, action: 'Appointment confirmed', details: 'Mary Wilson - 09:30 appointment', time: '10 min ago' },
      { id: 3, action: 'New appointment scheduled', details: 'Robert Brown - Tomorrow 2:00 PM', time: '15 min ago' },
      { id: 4, action: 'Appointment cancelled', details: 'Lisa Taylor - 11:00 appointment', time: '20 min ago' }
    ]);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'checked-in': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'scheduled': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'checked-in': return CheckCircle;
      case 'waiting': return Clock;
      case 'confirmed': return CheckCircle;
      case 'scheduled': return Calendar;
      case 'cancelled': return XCircle;
      default: return AlertCircle;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reception Dashboard</h1>
        <p className="text-gray-600">Manage appointments and patient check-ins efficiently.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Checked In"
          value={stats.checkedInPatients}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Waiting Patients"
          value={stats.waitingPatients}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Cancelled Today"
          value={stats.cancelledAppointments}
          icon={XCircle}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {todaySchedule.map((appointment) => {
                const StatusIcon = getStatusIcon(appointment.status);
                return (
                  <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                        <StatusIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{appointment.patient}</h3>
                        <p className="text-sm text-gray-600">{appointment.doctor}</p>
                        <p className="text-xs text-gray-500">{appointment.type} • {appointment.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Waiting Queue */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Waiting Queue</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {waitingQueue.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-600">{patient.doctor}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{patient.waitTime}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(patient.priority)}`}>
                      {patient.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                  <Bell className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.details}</p>
                </div>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <UserPlus className="h-6 w-6 text-blue-600 mr-2" />
            <span className="font-medium text-blue-900">Check In Patient</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <Calendar className="h-6 w-6 text-green-600 mr-2" />
            <span className="font-medium text-green-900">Schedule Appointment</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <Search className="h-6 w-6 text-purple-600 mr-2" />
            <span className="font-medium text-purple-900">Find Patient</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
            <Phone className="h-6 w-6 text-orange-600 mr-2" />
            <span className="font-medium text-orange-900">Call Patient</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;