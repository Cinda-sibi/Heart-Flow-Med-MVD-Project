// ## 4. src/components/dashboards/PatientDashboard.jsx
// ```javascript
import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Heart, 
  FileText, 
  Clock,
  Activity,
  User,
  Pill,
  AlertTriangle,
  TrendingUp,
  Download
} from 'lucide-react';
import { fetchUpcomingAppointments } from '../../apis/PatientsDashboardApis';

const PatientDashboard = () => {
  const [patientData, setPatientData] = useState({
    nextAppointment: null,
    recentVisits: [],
    medications: [],
    vitalSigns: {},
    testResults: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch upcoming appointments
      const upcomingRes = await fetchUpcomingAppointments();
      let nextAppointment = null;
      let recentVisits = [];
      if (upcomingRes.status && Array.isArray(upcomingRes.data) && upcomingRes.data.length > 0) {
        // First is next appointment, rest are recent visits
        const [first, ...rest] = upcomingRes.data;
        nextAppointment = {
          date: first.date,
          time: first.time,
          doctor: first.doctor_name,
          type: first.status,
          notes: first.notes
        };
        recentVisits = rest.map(appt => ({
          date: appt.date,
          doctor: appt.doctor_name,
          type: appt.status,
          notes: appt.notes
        }));
      }
      // TODO: Replace the following with real API calls for medications, vitals, test results
      setPatientData({
        nextAppointment,
        recentVisits,
        medications: [
          { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', refillDate: '2024-02-28' },
          { name: 'Metoprolol', dosage: '25mg', frequency: 'Twice daily', refillDate: '2024-03-05' },
          { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily', refillDate: '2024-02-15' }
        ],
        vitalSigns: {
          bloodPressure: '128/82',
          heartRate: '72',
          weight: '165 lbs',
          lastUpdated: '2024-01-15'
        },
        testResults: [
          { test: 'Cholesterol Panel', date: '2024-01-15', status: 'Normal', downloadable: true },
          { test: 'ECG', date: '2023-12-10', status: 'Normal', downloadable: true },
          { test: 'Blood Count', date: '2023-11-20', status: 'Pending Review', downloadable: false }
        ]
      });
    } catch (err) {
      setError('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const InfoCard = ({ title, children, icon: Icon, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-4">
        <div className={`p-2 rounded-lg bg-${color}-100 mr-3`}>
          <Icon className={`h-5 w-5 text-${color}-600`} />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      {children}
    </div>
  );

  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Health Dashboard</h1>
        <p className="text-gray-600">Track your health journey and stay connected with your care team.</p>
      </div>

      {/* Next Appointment */}
      {loading ? (
        <div className="bg-blue-100 rounded-lg shadow p-6 text-blue-700">Loading upcoming appointment...</div>
      ) : error ? (
        <div className="bg-red-100 rounded-lg shadow p-6 text-red-700">{error}</div>
      ) : patientData.nextAppointment ? (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Upcoming Appointment</h2>
              <p className="text-blue-100 mb-1">Scheduled</p>
              <p className="text-lg font-medium">
                {patientData.nextAppointment.date} at {patientData.nextAppointment.time}
              </p>
              <p className="text-blue-100">with {patientData.nextAppointment.doctor}</p>
              {patientData.nextAppointment.notes && (
                <p className="text-blue-200 mt-2">Notes: {patientData.nextAppointment.notes}</p>
              )}
            </div>
            <div className="text-right">
              <Calendar className="h-12 w-12 text-blue-200" />
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vital Signs */}
        <InfoCard title="Latest Vital Signs" icon={Activity} color="green">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Blood Pressure</span>
              <span className="font-medium">{patientData.vitalSigns.bloodPressure} mmHg</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Heart Rate</span>
              <span className="font-medium">{patientData.vitalSigns.heartRate} bpm</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Weight</span>
              <span className="font-medium">{patientData.vitalSigns.weight}</span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-500">
                Last updated: {patientData.vitalSigns.lastUpdated}
              </span>
            </div>
          </div>
        </InfoCard>

        {/* Current Medications */}
        <InfoCard title="Current Medications" icon={Pill} color="purple">
          <div className="space-y-3">
            {patientData.medications.map((med, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-gray-900">{med.name}</h3>
                    <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Refill by</p>
                    <p className="text-sm font-medium">{med.refillDate}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </InfoCard>

        {/* Test Results */}
        <InfoCard title="Recent Test Results" icon={FileText} color="blue">
          <div className="space-y-3">
            {patientData.testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{result.test}</h3>
                  <p className="text-sm text-gray-600">{result.date}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    result.status === 'Normal' 
                      ? 'bg-green-100 text-green-800'
                      : result.status === 'Pending Review'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.status}
                  </span>
                  {result.downloadable && (
                    <button className="p-1 text-gray-400 hover:text-blue-600">
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </InfoCard>

        {/* Recent Visits */}
        <InfoCard title="Recent Visits" icon={Clock} color="indigo">
          <div className="space-y-3">
            {patientData.recentVisits.length === 0 ? (
              <div className="text-gray-500">No recent visits.</div>
            ) : patientData.recentVisits.map((visit, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{visit.type}</h3>
                    <p className="text-sm text-gray-600">{visit.doctor}</p>
                  </div>
                  <span className="text-sm text-gray-500">{visit.date}</span>
                </div>
                <p className="text-sm text-gray-700">{visit.notes}</p>
              </div>
            ))}
          </div>
        </InfoCard>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <button className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <Calendar className="h-6 w-6 text-blue-600 mb-2" />
            <span className="font-medium text-blue-900">Book Appointment</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <Heart className="h-6 w-6 text-green-600 mb-2" />
            <span className="font-medium text-green-900">Log Vitals</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <FileText className="h-6 w-6 text-purple-600 mb-2" />
            <span className="font-medium text-purple-900">Message Doctor</span>
          </button>
          <button className="flex flex-col items-center justify-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
            <Pill className="h-6 w-6 text-orange-600 mb-2" />
            <span className="font-medium text-orange-900">Refill Prescription</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;