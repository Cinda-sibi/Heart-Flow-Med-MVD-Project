import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Heart, 
  FileText, 
  TrendingUp, 
  Clock,
  AlertCircle,
  CheckCircle,
  X,
  Eye,
  UserPlus
} from 'lucide-react';
import { fetchAllPatients, fetchTodaysAppointments, fetchDoctorPatientCount, fetchDoctorTodaysAppointmentsCount, fetchAllDoctorAppointments, addDoctorNotesToReferral, fetchReferralsByStatus, addPatient } from '../../apis/DoctorDashboardApis';
import { getRecentPatientReferrals ,getPatientReferrals } from '../../apis/GeneralPractinionerDashboardApis';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// Utility: Format ISO date string to 'YYYY-MM-DD HH:mm:ss' (24-hour)
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  // Pad helper
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const CardiologistDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingResults: 0,
    urgentCases: 0
  });

  const [recentPatients, setRecentPatients] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [recentReferrals, setRecentReferrals] = useState([]);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [appointmentsByDate, setAppointmentsByDate] = useState({});
  const [selectedDayAppointments, setSelectedDayAppointments] = useState([]);
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [referralNotes, setReferralNotes] = useState({});
  const [noteInput, setNoteInput] = useState('');
  const [allAppointments, setAllAppointments] = useState([]);
  const [noteSaveStatus, setNoteSaveStatus] = useState('idle'); // idle | saving | success | error
  const [activeTab, setActiveTab] = useState('recentReferrals'); // 'recentReferrals' | 'ongoingPatients'
  const [ongoingReferrals, setOngoingReferrals] = useState([]);
  const [ongoingLoading, setOngoingLoading] = useState(false);
  const [ongoingError, setOngoingError] = useState(null);
  const [recentPage, setRecentPage] = useState(1);
  const itemsPerPage = 5;
  const [ongoingPage, setOngoingPage] = useState(1);
  const [registeringId, setRegisteringId] = useState(null); // Track which referral is being registered
  const [registerSuccess, setRegisterSuccess] = useState(false);

  useEffect(() => {
    // Fetch dashboard data
    fetchDashboardData();
    fetchRecentPatients();
    fetchTodaysAppointmentsData();
    fetchRecentReferrals();
    fetchAllAppointmentsForCalendar();
  }, []);

  useEffect(() => {
    if (activeTab === 'ongoingPatients') {
      setOngoingLoading(true);
      setOngoingError(null);
      fetchReferralsByStatus('Ongoing')
        .then(res => setOngoingReferrals(res.data?.data || res.data || []))
        .catch(() => setOngoingError('Failed to fetch ongoing referrals'))
        .finally(() => setOngoingLoading(false));
    }
  }, [activeTab]);

  useEffect(() => { setRecentPage(1); }, [recentReferrals]);
  useEffect(() => { setOngoingPage(1); }, [ongoingReferrals, activeTab]);

  const fetchDashboardData = async () => {
    try {
      const [patientCountRes, todaysAppointmentsCountRes] = await Promise.all([
        fetchDoctorPatientCount(),
        fetchDoctorTodaysAppointmentsCount()
      ]);
      setStats((prev) => ({
        ...prev,
        totalPatients: (patientCountRes.data && patientCountRes.data.patient_count) || 0,
        todayAppointments: (todaysAppointmentsCountRes.data && (todaysAppointmentsCountRes.data.todays_appointments_count || todaysAppointmentsCountRes.data.patient_count || todaysAppointmentsCountRes.data.count)) || 0,
      }));
    } catch (error) {
      setStats((prev) => ({
        ...prev,
        totalPatients: 0,
        todayAppointments: 0,
      }));
    }
  };

  // Fetch today's appointments from API
  const fetchTodaysAppointmentsData = async () => {
    try {
      const response = await fetchTodaysAppointments();
      // response.data is the array of appointments
      const appointments = (response.data || []).map((a) => ({
        id: a.id,
        time: a.time || '',
        patient: a.patient_name || '',
        type: a.type || '',
        status: a.status || '',
      }));
      setUpcomingAppointments(appointments);
    } catch (error) {
      setUpcomingAppointments([]);
      // Optionally handle error (e.g., show notification)
    }
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

  // Fetch recent referrals
  const fetchRecentReferrals = async () => {
    try {
      const response = await fetchReferralsByStatus('Pending');
      // The API returns { data: { status: true, data: [...] } } or similar
      // Use response.data.data or response.data depending on backend
      setRecentReferrals(response.data?.data || response.data || []);
    } catch (error) {
      setRecentReferrals([]);
    }
  };

  const fetchAllAppointmentsForCalendar = async () => {
    try {
      const response = await fetchAllDoctorAppointments();
      setAllAppointments(response.data || []);
    } catch (error) {
      setAllAppointments([]);
    }
  };

  // Build appointments by date for calendar (using allAppointments)
  useEffect(() => {
    const byDate = {};
    allAppointments.forEach((appt) => {
      if (!appt.date) return;
      if (!byDate[appt.date]) byDate[appt.date] = [];
      byDate[appt.date].push(appt);
    });
    setAppointmentsByDate(byDate);
  }, [allAppointments]);

  // Download referral PDF (placeholder logic)
  const handleDownloadReferral = async (referral) => {
    // You may need to adjust the endpoint/logic based on your backend
    alert('Download logic for referral PDF goes here.');
  };

  const handleOpenReferral = async (ref) => {
    setSelectedReferral(ref);
    setNoteInput(referralNotes[ref.id] || ref.doctor_notes || '');
    // Optionally, fetch latest notes from backend if not present
    if (!ref.doctor_notes && !referralNotes[ref.id]) {
      // You can implement a fetchReferralById API if needed for freshest data
      // For now, fallback to empty string
      setNoteInput('');
    }
  };

  const handleCloseReferral = () => {
    setSelectedReferral(null);
    setNoteInput('');
  };

  const handleSaveNote = async () => {
    if (!selectedReferral) return;
    setNoteSaveStatus('saving');
    try {
      await addDoctorNotesToReferral(selectedReferral.id, noteInput);
      setReferralNotes((prev) => ({ ...prev, [selectedReferral.id]: noteInput }));
      setNoteSaveStatus('success');
      setTimeout(() => setNoteSaveStatus('idle'), 2000);
    } catch (error) {
      setNoteSaveStatus('error');
      setTimeout(() => setNoteSaveStatus('idle'), 2000);
    }
  };

  // Calendar tile content: dot if appointments exist
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = date.toDateString();
      if (appointmentsByDate[dateStr]) {
        return <span className="block w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></span>;
      }
    }
    return null;
  };

  // On calendar day click
  const handleCalendarClick = (date) => {
    setCalendarDate(date);
    // Format as YYYY-MM-DD
    const dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    setSelectedDayAppointments(appointmentsByDate[dateKey] || []);
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

  // For Recent Referrals
  const paginatedRecentReferrals = recentReferrals.slice(
    (recentPage - 1) * itemsPerPage,
    recentPage * itemsPerPage
  );

  // For Ongoing Referrals
  const paginatedOngoingReferrals = ongoingReferrals.slice(
    (ongoingPage - 1) * itemsPerPage,
    ongoingPage * itemsPerPage
  );

  const totalPages = Math.ceil(recentReferrals.length / itemsPerPage);

  // Accept and register a patient
  const handleAcceptAndRegister = async (referral) => {
    setRegisteringId(referral.id);
    try {
      // Map referral fields to the correct add-patient payload structure
      const payload = {
        first_name: referral.patient_first_name || referral.first_name || '',
        last_name: referral.patient_last_name || referral.last_name || '',
        email: referral.patient_email || referral.email || '',
        gender: referral.gender || '',
        age: referral.age || '',
        medical_reference_no: referral.medical_reference_no || '',
      };
      // If there is an uploaded file (id_records), include it
      if (referral.id_records) {
        payload.id_records = referral.id_records;
      }
      await addPatient(payload);
      setRegisterSuccess(true);
      setTimeout(() => setRegisterSuccess(false), 3000);
      // After successful registration, update the referral status locally to remove the button
      setRecentReferrals((prev) => prev.map(r => r.id === referral.id ? { ...r, status: 'Registered' } : r));
      setOngoingReferrals((prev) => prev.map(r => r.id === referral.id ? { ...r, status: 'Registered' } : r));
    } catch (error) {
      alert('Failed to register patient.');
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cardiologist Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your overview for today.</p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Total Patients */}
        <div className="bg-white rounded-lg shadow flex items-center p-6">
          <div className="p-3 rounded-lg bg-blue-100">
            <Users className="h-7 w-7 text-blue-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Patients</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
          </div>
        </div>
        {/* Today's Appointments */}
        <div className="bg-white rounded-lg shadow flex items-center p-6">
          <div className="p-3 rounded-lg bg-green-100">
            <Calendar className="h-7 w-7 text-green-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
            <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
          </div>
        </div>
        {/* Available Staff */}
        <div className="bg-white rounded-lg shadow flex items-center p-6">
          <div className="p-3 rounded-lg bg-purple-100">
            <Users className="h-7 w-7 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Available Staff</p>
            <p className="text-2xl font-bold text-gray-900">{stats.availableStaff ?? '--'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Toggle Button Group */}
        <div className="col-span-2 flex flex-col sm:flex-row justify-start mb-2 gap-2 w-full">
          <button
            className={`w-full sm:w-auto px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors ${activeTab === 'recentReferrals' ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-gray-600 bg-white'}`}
            onClick={() => setActiveTab('recentReferrals')}
          >
            Recent Patient Referrals
          </button>
          <button
            className={`w-full sm:w-auto px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors ${activeTab === 'ongoingPatients' ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-gray-600 bg-white'}`}
            onClick={() => setActiveTab('ongoingPatients')}
          >
            Ongoing Patients
          </button>
        </div>
        {/* Recent Patient Referrals or Ongoing Patients */}
        {activeTab === 'recentReferrals' ? (
          <div className="bg-white rounded-lg shadow flex flex-col h-[500px]">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Patient Referrals</h2>
            </div>
            <div className="p-6 flex-1 flex flex-col overflow-hidden">
              {paginatedRecentReferrals.length === 0 ? (
                <div className="text-center text-gray-500 flex-1 flex items-center justify-center">No recent referrals found</div>
              ) : (
                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                  {paginatedRecentReferrals.map((ref) => (
                    <div key={ref.id} className="flex flex-col bg-gray-50 rounded-lg p-4 mb-2 gap-2 relative">
                      {/* Top Row: Patient Details and View Icon */}
                      <div className="flex flex-row items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-base truncate">
                            {ref.patient_first_name} {ref.patient_last_name}
                          </div>
                          <div className="text-sm text-gray-700 break-words max-w-xs sm:max-w-md">
                           MRI : {ref.medical_reference_no}
                          </div>
                          <div className="text-sm text-gray-700 break-words max-w-xs sm:max-w-md">
                           Referred By : {ref.referred_by_name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {ref.referred_at ? formatDate(ref.referred_at) : '-'}
                          </div>
                        </div>
                        <button
                          className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 ml-2"
                          title="View Details"
                          onClick={() => handleOpenReferral(ref)}
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                      {/* Bottom Row: Accept & Register Button */}
                      {ref.is_accepted === false && (
                        <button
                          className="self-end mt-2 px-3 py-1 text-xs rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center gap-1"
                          title="Accept & Register"
                          onClick={() => handleAcceptAndRegister(ref)}
                          disabled={registeringId === ref.id}
                        >
                          {registeringId === ref.id ? (
                            <span className="animate-spin inline-block align-middle"><UserPlus className="h-4 w-4 inline" /></span>
                          ) : (
                            <><UserPlus className="h-4 w-4 inline mr-1" />Accept & Register</>
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Recent Referrals Pagination */}
            <div className="flex justify-center mt-4">
              <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
                <button
                  className={`px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-l-md hover:bg-blue-50 transition ${recentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => setRecentPage((p) => Math.max(1, p - 1))}
                  disabled={recentPage === 1}
                >
                  Prev
                </button>
                <span className="px-4 py-2 border-t border-b border-gray-300 bg-gray-100 text-blue-700 font-semibold">
                  {recentPage}
                </span>
                <button
                  className={`px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-r-md hover:bg-blue-50 transition ${(recentPage * itemsPerPage >= recentReferrals.length) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => setRecentPage((p) => p + 1)}
                  disabled={recentPage * itemsPerPage >= recentReferrals.length}
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow flex flex-col h-[500px]">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Ongoing Patients</h2>
            </div>
            <div className="p-6 flex-1 flex flex-col overflow-hidden">
              {ongoingLoading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : ongoingError ? (
                <div className="text-center text-red-500">{ongoingError}</div>
              ) : paginatedOngoingReferrals.length === 0 ? (
                <div className="text-center text-gray-500 flex-1 flex items-center justify-center">No ongoing patients found</div>
              ) : (
                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                  {paginatedOngoingReferrals.map((ref) => (
                    <div key={ref.id} className="flex flex-col bg-gray-50 rounded-lg p-4 mb-2 gap-2 relative">
                      {/* Top Row: Patient Details and View Icon */}
                      <div className="flex flex-row items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-base truncate">
                            {ref.patient_first_name} {ref.patient_last_name}
                          </div>
                          <div className="text-sm text-gray-700 break-words max-w-xs sm:max-w-md">
                           MRN : {ref.medical_reference_no}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                           Referred By: {ref.referred_by_name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {ref.referred_at ? formatDate(ref.referred_at) : '-'}
                          </div>
                        </div>
                        <button
                          className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 ml-2"
                          title="View Details"
                          onClick={() => handleOpenReferral(ref)}
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                      {/* Bottom Row: Accept & Register Button */}
                      {ref.is_accepted === false && (
                        <button
                          className="self-end mt-2 px-3 py-1 text-xs rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center gap-1"
                          title="Accept & Register"
                          onClick={() => handleAcceptAndRegister(ref)}
                          disabled={registeringId === ref.id}
                        >
                          {registeringId === ref.id ? (
                            <span className="animate-spin inline-block align-middle"><UserPlus className="h-4 w-4 inline" /></span>
                          ) : (
                            <><UserPlus className="h-4 w-4 inline mr-1" />Accept & Register</>
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Ongoing Referrals Pagination */}
            <div className="flex justify-center mt-4">
              <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
                <button
                  className={`px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-l-md hover:bg-blue-50 transition ${ongoingPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => setOngoingPage((p) => Math.max(1, p - 1))}
                  disabled={ongoingPage === 1}
                >
                  Prev
                </button>
                <span className="px-4 py-2 border-t border-b border-gray-300 bg-gray-100 text-blue-700 font-semibold">
                  {ongoingPage}
                </span>
                <button
                  className={`px-4 py-2 border border-gray-300 bg-white text-sm font-medium rounded-r-md hover:bg-blue-50 transition ${(ongoingPage * itemsPerPage >= ongoingReferrals.length) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => setOngoingPage((p) => p + 1)}
                  disabled={ongoingPage * itemsPerPage >= ongoingReferrals.length}
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        )}
        {/* Today's Appointments */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Today's Appointments</h2>
            {upcomingAppointments.length > 3 && !showAllAppointments && (
              <button
                className="text-blue-600 hover:underline text-sm font-medium"
                onClick={() => setShowAllAppointments(true)}
              >
                View More
              </button>
            )}
            {showAllAppointments && (
              <button
                className="text-blue-600 hover:underline text-sm font-medium"
                onClick={() => setShowAllAppointments(false)}
              >
                Show Less
              </button>
            )}
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {(showAllAppointments ? upcomingAppointments : upcomingAppointments.slice(0, 3)).length === 0 ? (
                <div className="text-center text-gray-500">No appointments found</div>
              ) : (
                (showAllAppointments ? upcomingAppointments : upcomingAppointments.slice(0, 3)).map((appointment) => (
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
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar for Appointments */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointments Calendar</h2>
        <div className="flex flex-col md:flex-row gap-8">
          <ReactCalendar
            onChange={handleCalendarClick}
            value={calendarDate}
            tileContent={tileContent}
          />
          <div className="flex-1">
            <h3 className="text-md font-semibold text-gray-800 mb-2">Appointments on {calendarDate.toDateString()}</h3>
            {selectedDayAppointments.length === 0 ? (
              <div className="text-gray-500">No appointments for this day.</div>
            ) : (
              <ul className="space-y-2">
                {selectedDayAppointments.map((appt) => (
                  <li key={appt.id} className="bg-gray-50 rounded p-3 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <span className="font-medium text-gray-900">{appt.patient_name}</span>
                      <span className="ml-2 text-sm text-gray-600">{appt.time}</span>
                      <span className="ml-2 text-xs text-gray-500">{appt.status}</span>
                      <div className="text-xs text-gray-400">{appt.notes}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
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

      {/* Referral Details Modal */}
      {selectedReferral && (
        <div className="fixed top-0 left-0 w-screen h-screen z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-0 relative overflow-hidden">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 z-10"
              onClick={handleCloseReferral}
            >
              <X className="h-6 w-6" />
            </button>
            <div className="flex flex-col md:flex-row">
              {/* Left: Patient & Referral Info */}
              <div className="md:w-1/2 p-8 space-y-4 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50">
                <h2 className="text-2xl font-bold text-blue-800 mb-2 flex items-center gap-2"><FileText className="h-6 w-6 text-blue-500" /> Referral Details</h2>
                <div className="space-y-2">
                  <div><span className="font-semibold">Patient Name:</span> {selectedReferral.patient_first_name} {selectedReferral.patient_last_name}</div>
                  <div><span className="font-semibold">Email:</span> {selectedReferral.patient_email}</div>
                  <div><span className="font-semibold">Phone:</span> {selectedReferral.patient_phone}</div>
                  <div><span className="font-semibold">Gender:</span> {selectedReferral.gender || '-'}</div>
                  <div><span className="font-semibold">Age:</span> {selectedReferral.age || '-'}</div>
                  <div><span className="font-semibold">Reason:</span> {selectedReferral.reason}</div>
                  <div><span className="font-semibold">Status:</span> {selectedReferral.status}</div>
                  <div><span className="font-semibold">Referred At:</span> {selectedReferral.referred_at ? new Date(selectedReferral.referred_at).toLocaleString() : '-'}</div>
                  {selectedReferral.transcription && (
                    <div><span className="font-semibold">Transcription:</span> {selectedReferral.transcription}</div>
                  )}
                  {selectedReferral.summary && (
                    <div><span className="font-semibold">Summary:</span> {selectedReferral.summary}</div>
                  )}
                </div>
                <div className="mt-6">
                  <label className="block font-semibold mb-1 text-blue-700">Add Notes</label>
                  <textarea
                    className="w-full border rounded-lg px-3 py-2 min-h-[120px] text-base focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    value={noteInput}
                    onChange={e => setNoteInput(e.target.value)}
                    placeholder="Add your notes for blood testing, CTC scanning, echocardiogram, etc..."
                  />
                  <button
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                    onClick={handleSaveNote}
                    disabled={noteSaveStatus === 'saving'}
                  >
                    {noteSaveStatus === 'saving' ? 'Saving...' : 'Save Note'}
                  </button>
                  {noteSaveStatus === 'success' && (
                    <div className="mt-2 text-green-600 text-sm">Note saved!</div>
                  )}
                  {noteSaveStatus === 'error' && (
                    <div className="mt-2 text-red-600 text-sm">Failed to save note. Please try again.</div>
                  )}
                </div>
              </div>
              {/* Right: PDF Preview */}
              <div className="md:w-1/2 p-8 flex flex-col items-center justify-center bg-white">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2"><FileText className="h-5 w-5 text-green-600" /> Referral PDF</h3>
                {selectedReferral.referral_pdf ? (
                  <>
                    <div className="w-full h-72 md:h-96 border rounded shadow mb-4 overflow-hidden bg-gray-100 flex items-center justify-center">
                      <iframe
                        src={`${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}/${selectedReferral.referral_pdf}`}
                        title="Referral PDF Preview"
                        className="w-full h-full"
                        frameBorder="0"
                      />
                    </div>
                    <a
                      href={`${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}/${selectedReferral.referral_pdf}`}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow"
                    >
                      <FileText className="h-4 w-4" /> Download PDF
                    </a>
                  </>
                ) : (
                  <div className="text-gray-400 italic">No PDF available for this referral.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast/Alert */}
      {registerSuccess && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg text-lg font-semibold transition-all">
          Patient registered successfully!
        </div>
      )}
    </div>
  );
};

export default CardiologistDashboard;