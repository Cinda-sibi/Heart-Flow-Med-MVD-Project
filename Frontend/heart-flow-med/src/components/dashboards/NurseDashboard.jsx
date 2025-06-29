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
  Heart,
  Download
} from 'lucide-react';
import { getAssignedPatients, getDiagnosticTasksSummary,getTodaysAssignedPatients } from '../../apis/NurseDashboardApis';
import Modal from '../layout/Modal';

const NurseDashboard = () => {
  const [stats, setStats] = useState({
    assignedPatients: 0,
    completedTasks: 0,
    pendingTasks: 0
  });

  const [patientQueue, setPatientQueue] = useState([]);
  const [tasks, setTasks] = useState([]);
  // const [recentVitals, setRecentVitals] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 5; // You can adjust this number

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch summary counts for cards
      const summary = await getDiagnosticTasksSummary();
      setStats({
        assignedPatients: summary.assigned_patients || 0,
        completedTasks: summary.completed_tasks || 0,
        pendingTasks: summary.pending_tasks || 0
      });
    } catch (error) {
      setStats({ assignedPatients: 0, completedTasks: 0, pendingTasks: 0 });
    }

    try {
      const assignedPatients = await getTodaysAssignedPatients();
      setPatientQueue(assignedPatients);
    } catch (error) {
      setPatientQueue([]);
    }

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

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = patientQueue.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(patientQueue.length / patientsPerPage);

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Nurse Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your patients and daily tasks efficiently.</p>
        </div>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Queue */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-100/60 to-green-100/40 rounded-t-2xl">
            <h2 className="text-xl  text-gray-900">Assigned Patients</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {patientQueue.length === 0 ? (
                <div className="text-center text-gray-400 py-8 font-semibold">No data found</div>
              ) : (
                currentPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl shadow hover:shadow-lg transition-shadow border border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-200 rounded-full shadow">
                        <Users className="h-6 w-6 text-blue-700" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{patient.patient_name}</h3>
                        <p className="text-xs text-gray-500">Test: {patient.test_name}</p>
                        <p className="text-xs text-gray-400">{patient.date} {patient.time}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${getPriorityColor(patient.status)}`}>{patient.status?.toUpperCase()}</span>
                      <button
                        className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-400"
                        onClick={() => { setSelectedPatient(patient); setIsModalOpen(true); }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-center mt-4 space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-2 py-1">{currentPage} / {totalPages}</span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modernized Modal for Patient Details */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {selectedPatient && (
          <div className="space-y-4">
            <h2 className="text-2xl font-extrabold text-blue-700 mb-2 border-b pb-2 border-blue-100">Patient Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="font-semibold text-gray-700">Name:</span>
                <span className="ml-2 text-gray-900">{selectedPatient.patient_name}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Test:</span>
                <span className="ml-2 text-gray-900">{selectedPatient.test_name}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Date:</span>
                <span className="ml-2 text-gray-900">{selectedPatient.date}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Time:</span>
                <span className="ml-2 text-gray-900">{selectedPatient.time}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Note:</span>
                <span className="ml-2 text-gray-900">{selectedPatient.notes}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Status:</span>
                <span className={`ml-2 font-semibold ${getPriorityColor(selectedPatient.status)}`}>{selectedPatient.status?.toUpperCase()}</span>
              </div>
            </div>
            {selectedPatient.attached_report_url && (
              <div className="flex space-x-3 mt-4">
                <a
                  href={selectedPatient.attached_report_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold shadow focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Report
                </a>
                <a
                  href={selectedPatient.attached_report_url}
                  download
                  className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-sm font-semibold shadow focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NurseDashboard;