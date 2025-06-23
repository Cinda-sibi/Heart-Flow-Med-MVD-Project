import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Calendar, ClipboardList } from 'lucide-react';

const GeneralPractitioner = () => {
  // State for assigned patients, appointments, and form
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Placeholder: Fetch assigned patients and appointments
  useEffect(() => {
    // TODO: Replace with real API calls
    setLoading(true);
    setTimeout(() => {
      setAssignedPatients([
        { id: 1, name: 'John Doe', age: 45, status: 'Active' },
        { id: 2, name: 'Jane Smith', age: 52, status: 'Active' },
      ]);
      setAppointments([
        { id: 1, patient: 'John Doe', date: '2024-06-01', time: '10:00', status: 'Scheduled' },
        { id: 2, patient: 'Jane Smith', date: '2024-06-02', time: '11:30', status: 'Scheduled' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <main className="flex-1 p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">General Practitioner Dashboard</h1>
        <p className="text-gray-600">Manage your patients and clinic assignments.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <Users className="h-8 w-8 text-blue-600 mr-4" />
          <div>
            <div className="text-lg font-semibold">{assignedPatients.length}</div>
            <div className="text-gray-600">Assigned Patients</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <Calendar className="h-8 w-8 text-green-600 mr-4" />
          <div>
            <div className="text-lg font-semibold">{appointments.length}</div>
            <div className="text-gray-600">Upcoming Appointments</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <ClipboardList className="h-8 w-8 text-purple-600 mr-4" />
          <div>
            <div className="text-lg font-semibold">-</div>
            <div className="text-gray-600">Clinic Assignments</div>
          </div>
        </div>
      </div>

      {/* Assigned Patients Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center"><Users className="h-5 w-5 mr-2" />Assigned Patients</h2>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignedPatients.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{p.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{p.age}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Patient to Clinic (Placeholder) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center"><UserPlus className="h-5 w-5 mr-2" />Assign Patient to Clinic</h2>
        {/* TODO: Add form/modal to assign patient to clinic */}
        <div className="text-gray-500">Feature coming soon...</div>
      </div>

      {/* Upcoming Appointments Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center"><Calendar className="h-5 w-5 mr-2" />Upcoming Appointments</h2>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{appt.patient}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{appt.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{appt.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{appt.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
};

export default GeneralPractitioner;
