import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clipboard, 
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileText,
  Thermometer,
  Heart
} from 'lucide-react';

const NurseDashboard = () => {
  const [stats, setStats] = useState({
    assignedPatients: 0,
    completedTasks: 0,
    pendingTasks: 0,
    vitalSignsChecks: 0
  });

  const [patientQueue, setPatientQueue] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [recentVitals, setRecentVitals] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Mock data - replace with actual API calls
    setStats({
      assignedPatients: 15,
      completedTasks: 8,
      pendingTasks: 4,
      vitalSignsChecks: 12
    });

    setPatientQueue([
      { id: 1, name: 'John Smith', room: '201A', priority: 'high', reason: 'Post-op monitoring' },
      { id: 2, name: 'Mary Johnson', room: '205B', priority: 'medium', reason: 'Medication administration' },
      { id: 3, name: 'Robert Brown', room: '203C', priority: 'low', reason: 'Routine vitals' },
      { id: 4, name: 'Lisa Wilson', room: '207A', priority: 'high', reason: 'Pain assessment' }
    ]);

    setTasks([
      { id: 1, task: 'Administer medication - Room 201A', time: '10:00 AM', completed: false, priority: 'high' },
      { id: 2, task: 'Check vital signs - Room 205B', time: '10:30 AM', completed: true, priority: 'medium' },
      { id: 3, task: 'Wound dressing change - Room 203C', time: '11:00 AM', completed: false, priority: 'medium' },
      { id: 4, task: 'Patient education - Room 207A', time: '11:30 AM', completed: false, priority: 'low' }
    ]);

    setRecentVitals([
      { patient: 'John Smith', room: '201A', bp: '140/90', hr: '88', temp: '98.6°F', time: '09:30 AM' },
      { patient: 'Mary Johnson', room: '205B', bp: '125/80', hr: '72', temp: '97.8°F', time: '09:15 AM' },
      { patient: 'Robert Brown', room: '203C', bp: '130/85', hr: '75', temp: '98.2°F', time: '09:00 AM' }
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nurse Dashboard</h1>
        <p className="text-gray-600">Manage your patients and daily tasks efficiently.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Assigned Patients"
          value={stats.assignedPatients}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Completed Tasks"
          value={stats.completedTasks}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Vitals Recorded"
          value={stats.vitalSignsChecks}
          icon={Activity}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Queue */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Patient Queue</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {patientQueue.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-600">Room {patient.room}</p>
                      <p className="text-sm text-gray-500">{patient.reason}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(patient.priority)}`}>
                    {patient.priority.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's Tasks */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Today's Tasks</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full ${
                      task.completed ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {task.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {task.task}
                      </h3>
                      <p className="text-sm text-gray-600">{task.time}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Vital Signs */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Vital Signs</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 font-medium text-gray-900">Patient</th>
                  <th className="text-left py-2 font-medium text-gray-900">Room</th>
                  <th className="text-left py-2 font-medium text-gray-900">BP</th>
                  <th className="text-left py-2 font-medium text-gray-900">HR</th>
                  <th className="text-left py-2 font-medium text-gray-900">Temp</th>
                  <th className="text-left py-2 font-medium text-gray-900">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentVitals.map((vital, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 text-gray-900">{vital.patient}</td>
                    <td className="py-3 text-gray-600">{vital.room}</td>
                    <td className="py-3 text-gray-900">{vital.bp}</td>
                    <td className="py-3 text-gray-900">{vital.hr}</td>
                    <td className="py-3 text-gray-900">{vital.temp}</td>
                    <td className="py-3 text-gray-600">{vital.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <Thermometer className="h-6 w-6 text-blue-600 mr-2" />
            <span className="font-medium text-blue-900">Record Vitals</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <Clipboard className="h-6 w-6 text-green-600 mr-2" />
            <span className="font-medium text-green-900">Update Care Plan</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <FileText className="h-6 w-6 text-purple-600 mr-2" />
            <span className="font-medium text-purple-900">Patient Notes</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
            <span className="font-medium text-red-900">Emergency Alert</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NurseDashboard;