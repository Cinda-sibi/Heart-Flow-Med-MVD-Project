import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, Edit3, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Modal from "../../components/layout/Modal";
import { getAllDoctors, getAllPatients, bookAppointment, getAllDoctorAvailabilities, getAllAppointments, searchDoctorAvailability, editAppointment, cancelAppointment, getDoctorAvailabilityById } from '../../apis/AdministrativeStaffDashboardApis';
import enUS from 'date-fns/locale/en-US';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// Custom Toolbar for Calendar
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
function CustomToolbar({ label, onNavigate, date }) {
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  return (
    <div className="flex items-center justify-center gap-2 mb-2">
      <button onClick={() => onNavigate('PREV')} className="p-2 hover:bg-gray-100 rounded">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <select
        value={currentMonth}
        onChange={e => onNavigate('DATE', new Date(currentYear, Number(e.target.value), 1))}
        className="border rounded px-2 py-1"
      >
        {months.map((m, idx) => (
          <option key={m} value={idx}>{m}</option>
        ))}
      </select>
      <select
        value={currentYear}
        onChange={e => onNavigate('DATE', new Date(Number(e.target.value), currentMonth, 1))}
        className="border rounded px-2 py-1"
      >
        {years.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
      <button onClick={() => onNavigate('NEXT')} className="p-2 hover:bg-gray-100 rounded">
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);

  // Modal and form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    patient: '',
    doctor: '',
    date: '',
    time: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availabilities, setAvailabilities] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [availabilitySearch, setAvailabilitySearch] = useState("");
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState(null);
  // Add viewMode state for toggling
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'calendar'
  // For appointment details modal
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [doctorAvailabilities, setDoctorAvailabilities] = useState([]);
  const [doctorAvailLoading, setDoctorAvailLoading] = useState(false);

  // Fetch all doctors, availabilities, and appointments on mount
  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAllDoctors(),
      getAllDoctorAvailabilities(),
      getAllAppointments()
    ])
      .then(([doctorsData, availsRes, appointmentsRes]) => {
        const docs = Array.isArray(doctorsData.data) ? doctorsData.data : [];
        setDoctors(docs);
        const avails = Array.isArray(availsRes.data?.data) ? availsRes.data.data : [];
        setAvailabilities(avails);
        // --- APPOINTMENTS TO EVENTS ---
        const appts = Array.isArray(appointmentsRes.data?.data) ? appointmentsRes.data.data : (Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []);
        setAppointments(appts);
        const appointmentEvents = appts.map((appt) => {
          // Parse date and time (supports 12-hour format with AM/PM)
          let h = 0, m = 0;
          let timeStr = appt.time || '';
          let match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (match) {
            h = parseInt(match[1], 10);
            m = parseInt(match[2], 10);
            const ampm = match[3].toUpperCase();
            if (ampm === 'PM' && h !== 12) h += 12;
            if (ampm === 'AM' && h === 12) h = 0;
          } else {
            // fallback: try 24-hour format
            const parts = timeStr.split(":");
            if (parts.length >= 2) {
              h = parseInt(parts[0], 10);
              m = parseInt(parts[1], 10);
            }
          }
          const start = new Date(appt.date);
          start.setHours(h, m, 0, 0);
          const end = new Date(start);
          end.setMinutes(end.getMinutes() + 30); // 30 min duration
          return {
            title: `${appt.patient_name} with Dr. ${appt.doctor_name}`,
            start,
            end,
            allDay: false,
            resource: { ...appt, type: 'appointment' },
            doctorId: appt.doctor
          };
        });
        // --- AVAILABILITIES TO EVENTS (existing logic) ---
        const daysMap = {
          'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 0
        };
        const today = new Date();
        const availabilityEvents = avails.flatMap((a) => {
          const doc = docs.find(d => (d.user_id || d.id) === (a.doctor_id || a.doctor));
          const doctorName = doc ? ((doc.first_name && doc.last_name) ? `Dr. ${doc.first_name} ${doc.last_name}` : doc.name || doc.full_name || doc.username) : 'Doctor';
          let events = [];
          for (let i = 0; i < 14; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            if (d.getDay() === daysMap[a.day_of_week]) {
              const [sh, sm] = a.start_time.split(":").map(Number);
              const [eh, em] = a.end_time.split(":").map(Number);
              const start = new Date(d);
              start.setHours(sh, sm, 0, 0);
              const end = new Date(d);
              end.setHours(eh, em, 0, 0);
              events.push({
                title: `${doctorName} Available`,
                start,
                end,
                allDay: false,
                resource: { ...a, doctorName, type: 'availability' },
                doctorId: a.doctor_id || a.doctor
              });
            }
          }
          return events;
        });
        setCalendarEvents([...availabilityEvents, ...appointmentEvents]);
      })
      .catch(() => {
        setDoctors([]);
        setAvailabilities([]);
        setCalendarEvents([]);
        setAppointments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Debounced search for availabilities
  useEffect(() => {
    if (availabilitySearch.trim() === "") {
      // If search is empty, show all
      setLoading(true);
      getAllDoctorAvailabilities()
        .then((availsRes) => {
          const avails = Array.isArray(availsRes.data?.data) ? availsRes.data.data : [];
          setAvailabilities(avails);
        })
        .catch(() => setAvailabilities([]))
        .finally(() => setLoading(false));
      return;
    }
    setAvailabilityLoading(true);
    const handler = setTimeout(() => {
      // Split search into first_name and last_name if possible
      const [first, ...rest] = availabilitySearch.trim().split(" ");
      const params = { first_name: first };
      if (rest.length > 0) params.last_name = rest.join(" ");
      searchDoctorAvailability(params)
        .then((res) => {
          const avails = Array.isArray(res.data?.data) ? res.data.data : [];
          setAvailabilities(avails);
        })
        .catch(() => setAvailabilities([]))
        .finally(() => setAvailabilityLoading(false));
    }, 400);
    return () => clearTimeout(handler);
  }, [availabilitySearch]);

  // Filtered doctors for dropdown
  const filteredDoctors = doctors.filter(d => {
    const name = (d.first_name && d.last_name)
      ? `Dr. ${d.first_name} ${d.last_name}`
      : d.name || d.full_name || d.username || '';
    return name.toLowerCase().includes(doctorSearch.toLowerCase());
  });

  // Filter calendar events based on selected doctor
  const displayedEvents = selectedDoctor
    ? calendarEvents.filter(ev => String(ev.doctorId) === String(selectedDoctor))
    : calendarEvents;

  // Fetch doctors and patients when modal opens
  const openModal = async () => {
    setIsModalOpen(true);
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const [doctorsData, patientsData] = await Promise.all([
        getAllDoctors(),
        getAllPatients()
      ]);
      setDoctors(Array.isArray(doctorsData.data) ? doctorsData.data : []);
      setPatients(Array.isArray(patientsData.data) ? patientsData.data : []);
    } catch (err) {
      setError('Failed to load doctors or patients.');
      setDoctors([]);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setForm({ patient: '', doctor: '', date: '', time: '', notes: '' });
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Compose payload as required by API
      const payload = {
        patient: form.patient,
        doctor: form.doctor,
        date: form.date,
        time: form.time,
        notes: form.notes
      };
      await bookAppointment(payload);
      setSuccess('Appointment booked successfully!');
      // Optionally refresh appointments list here
      setTimeout(() => {
        closeModal();
      }, 1000);
    } catch (err) {
      // Try to extract backend error message
      const backendMsg = err?.response?.data?.message;
      setError(backendMsg || 'Failed to book appointment.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSlot = (slotInfo) => {
    setForm(prevForm => ({
      ...prevForm,
      date: format(slotInfo.start, 'yyyy-MM-dd'),
      time: format(slotInfo.start, 'HH:mm'),
      doctor: selectedDoctor
    }));
    setIsModalOpen(true);
  };

  // Edit appointment handler
  const handleEdit = async (appointment) => {
    setLoading(true);
    setError("");
    try {
      const [doctorsData, patientsData] = await Promise.all([
        getAllDoctors(),
        getAllPatients()
      ]);
      setDoctors(Array.isArray(doctorsData.data) ? doctorsData.data : []);
      setPatients(Array.isArray(patientsData.data) ? patientsData.data : []);
    } catch (err) {
      setError("Failed to load doctors or patients.");
      setDoctors([]);
      setPatients([]);
    } finally {
      setLoading(false);
      setAppointmentToEdit(appointment);
      setForm({
        patient: appointment.patient_id || appointment.patient || '',
        doctor: appointment.doctor_id || appointment.doctor || '',
        date: appointment.date || '',
        time: appointment.time || '',
        notes: appointment.notes || ''
      });
      setShowEditModal(true);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await editAppointment(appointmentToEdit.id, {
        patient: form.patient,
        doctor: form.doctor,
        date: form.date,
        time: form.time,
        notes: form.notes
      });
      setSuccess('Appointment updated successfully!');
      setTimeout(() => {
        setShowEditModal(false);
        setAppointmentToEdit(null);
        refreshAppointments();
      }, 1000);
    } catch (err) {
      const backendMsg = err?.response?.data?.message;
      setError(backendMsg || 'Failed to update appointment.');
    } finally {
      setLoading(false);
    }
  };

  // Cancel appointment handler
  const handleCancel = (appointment) => {
    setAppointmentToCancel(appointment);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!appointmentToCancel) return;
    setLoading(true);
    setError('');
    try {
      await cancelAppointment(appointmentToCancel.id);
      setShowCancelModal(false);
      setAppointmentToCancel(null);
      refreshAppointments();
    } catch (err) {
      setError('Failed to cancel appointment.');
    } finally {
      setLoading(false);
    }
  };

  const refreshAppointments = () => {
    setLoading(true);
    getAllAppointments()
      .then((appointmentsRes) => {
        setAppointments(Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []);
      })
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  };

  // Handler for clicking on an appointment event
  const handleEventClick = (event) => {
    if (event.resource?.type === 'appointment') {
      setSelectedAppointment(event.resource);
      setShowAppointmentModal(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Appointments</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" onClick={openModal}>
          New Appointment
        </button>
      </div>

      {/* Toggle Buttons for Table/Calendar View */}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-2 rounded ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setViewMode('table')}
        >
          Table View
        </button>
        <button
          className={`px-4 py-2 rounded ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setViewMode('calendar')}
        >
          Calendar View
        </button>
      </div>

      {/* Conditionally render Table or Calendar */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                 
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
              
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <User className="h-10 w-10 text-gray-400" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.patient_name || appointment.patientName || '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{appointment.doctor_name || appointment.doctorName || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 mr-2" />
                        {appointment.date}
                        <Clock className="h-4 w-4 ml-4 mr-2" />
                        {appointment.time}
                      </div>
                    </td>
                
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {appointment.status || '-'}
                      </span>
                    </td>
                  
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3 inline-flex items-center gap-1" onClick={() => handleEdit(appointment)}>
                        <Edit3 className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button className="text-red-600 hover:text-red-900 inline-flex items-center gap-1" onClick={() => handleCancel(appointment)}>
                        <Trash2 className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Calendar UI for Appointments */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-lg shadow overflow-hidden my-8 p-4">
          <h2 className="text-lg font-bold mb-4">Calendar View</h2>
          <div className="mb-4 flex items-center gap-2">
            <label className="font-medium">Filter by Doctor:</label>
            <select
              className="border rounded px-3 py-2"
              value={selectedDoctor}
              onChange={e => setSelectedDoctor(e.target.value)}
            >
              <option value="">All Doctors</option>
              {doctors.map((d) => (
                <option key={d.user_id || d.id} value={d.user_id || d.id}>
                  {(d.first_name && d.last_name)
                    ? `Dr. ${d.first_name} ${d.last_name}`
                    : d.name || d.full_name || d.username}
                </option>
              ))}
            </select>
          </div>
          <div style={{ height: 600 }}>
            <BigCalendar
              localizer={localizer}
              events={displayedEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              selectable
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleEventClick}
              popup
              views={['month']}
              defaultView="month"
              components={{ toolbar: CustomToolbar }}
              eventPropGetter={(event) => {
                if (event.resource?.type === 'appointment') {
                  let bg = '';
                  let color = '#222';
                  if (event.resource.status === 'Scheduled') {
                    bg = '#bae6fd'; // light blue
                    color = '#0369a1'; // blue text
                  } else if (event.resource.status === 'Cancelled') {
                    bg = '#fecaca'; // light red
                    color = '#b91c1c'; // red text
                  } else if (event.resource.status === 'Completed') {
                    bg = '#bbf7d0'; // light green
                    color = '#166534'; // green text
                  }
                  return {
                    style: {
                      backgroundColor: bg,
                      color,
                      borderRadius: '6px',
                      border: 'none',
                      fontWeight: 600,
                    }
                  };
                }
                // Default for availability
                return {
                  style: {
                    backgroundColor: '#2563eb',
                    color: 'white',
                    borderRadius: '6px',
                    border: 'none',
                  }
                };
              }}
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden my-8">
        <h2 className="text-lg font-bold px-6 py-4 bg-gray-50">Doctors' Availabilities</h2>
        {/* Search input for doctor availability */}
        <div className="px-6 py-2 flex items-center gap-2">
          <input
            type="text"
            className="border rounded px-3 py-2 w-full md:w-1/3"
            placeholder="Search doctor by name..."
            value={availabilitySearch}
            onChange={e => setAvailabilitySearch(e.target.value)}
            disabled={loading}
          />
          {availabilityLoading && <span className="text-xs text-gray-500 ml-2">Searching...</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {availabilities.map((a, idx) => {
                // Find the doctor object for this availability
                const doc = doctors.find(d => (d.user_id || d.id) === (a.doctor_id || a.doctor));
                const doctorName = doc
                  ? (doc.first_name && doc.last_name
                      ? `Dr. ${doc.first_name} ${doc.last_name}`
                      : doc.name || doc.full_name || doc.username)
                  : a.doctor_name || "-";
                // Format time
                const formatTime = (t) => t ? t.slice(0,5) : "-";
                return (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap">{doctorName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{a.day_of_week || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatTime(a.start_time)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{formatTime(a.end_time)}</td>
                  </tr>
                );
              })}
              {availabilities.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    No availabilities found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Appointment Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2 className="text-xl font-bold mb-4">Book Appointment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Patient</label>
            <select
              name="patient"
              value={form.patient}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
              disabled={loading}
            >
              <option value="">Select Patient</option>
              {Array.isArray(patients) && patients.map((p) => (
                <option key={p.user_id || p.id} value={p.user_id || p.id}>
                  {(p.first_name && p.last_name) 
                    ? `${p.first_name} ${p.last_name}` 
                    : p.name || p.full_name || p.username}
                  {p.unique_id ? ` (${p.unique_id})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Doctor</label>
            <select
              name="doctor"
              value={form.doctor}
              onChange={async (e) => {
                setForm({ ...form, doctor: e.target.value });
                setSelectedDoctor(e.target.value);
                setDoctorAvailabilities([]);
                if (e.target.value) {
                  setDoctorAvailLoading(true);
                  try {
                    const res = await getDoctorAvailabilityById(e.target.value);
                    setDoctorAvailabilities(res.data?.data?.availabilities || []);
                  } catch {
                    setDoctorAvailabilities([]);
                  }
                  setDoctorAvailLoading(false);
                }
              }}
              className="w-full border rounded px-3 py-2"
              required
              disabled={loading}
            >
              <option value="">Select Doctor</option>
              {doctors.map((d) => (
                <option key={d.user_id || d.id} value={d.user_id || d.id}>
                  {(d.first_name && d.last_name) 
                    ? `Dr. ${d.first_name} ${d.last_name}` 
                    : d.name || d.full_name || d.username}
                  {d.specialization ? ` (${d.specialization})` : ''}
                </option>
              ))}
            </select>
          </div>
          {form.doctor && (
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Doctor's Availabilities:</label>
              {doctorAvailLoading ? (
                <div className="text-xs text-gray-500">Loading...</div>
              ) : doctorAvailabilities.length > 0 ? (
                <ul className="text-xs bg-gray-50 rounded p-2">
                  {doctorAvailabilities.map((a, idx) => (
                    <li key={idx}>
                      <span className="font-semibold">{a.day}</span>
                      {a.date && <span> ({a.date})</span>}: {a.start_time} - {a.end_time}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-gray-400">No availabilities found for this doctor.</div>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Time</label>
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              rows={2}
              disabled={loading}
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <div className="flex justify-end">
            <button
              type="button"
              className="mr-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              onClick={closeModal}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)}>
        <h2 className="text-xl font-bold mb-4">Cancel Appointment</h2>
        <p>Are you sure you want to cancel this appointment?</p>
        <div className="flex justify-end mt-4">
          <button className="mr-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => setShowCancelModal(false)} disabled={loading}>No</button>
          <button className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700" onClick={confirmCancel} disabled={loading}>{loading ? 'Cancelling...' : 'Yes, Cancel'}</button>
        </div>
      </Modal>

      {/* Edit Appointment Modal */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setAppointmentToEdit(null); }}>
        <h2 className="text-xl font-bold mb-4">Edit Appointment</h2>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Patient</label>
            <select
              name="patient"
              value={form.patient}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
              disabled={loading}
            >
              <option value="">Select Patient</option>
              {Array.isArray(patients) && patients.map((p) => (
                <option key={p.user_id || p.id} value={p.user_id || p.id}>
                  {(p.first_name && p.last_name) 
                    ? `${p.first_name} ${p.last_name}` 
                    : p.name || p.full_name || p.username}
                  {p.unique_id ? ` (${p.unique_id})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Doctor</label>
            <select
              name="doctor"
              value={form.doctor}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
              disabled={loading}
            >
              <option value="">Select Doctor</option>
              {doctors.map((d) => (
                <option key={d.user_id || d.id} value={d.user_id || d.id}>
                  {(d.first_name && d.last_name) 
                    ? `Dr. ${d.first_name} ${d.last_name}` 
                    : d.name || d.full_name || d.username}
                  {d.specialization ? ` (${d.specialization})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Time</label>
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              rows={2}
              disabled={loading}
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <div className="flex justify-end">
            <button
              type="button"
              className="mr-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              onClick={() => { setShowEditModal(false); setAppointmentToEdit(null); }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Appointment Details Modal */}
      <Modal isOpen={showAppointmentModal} onClose={() => setShowAppointmentModal(false)}>
        <div className="p-2 sm:p-4">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="inline-block h-6 w-6 text-blue-600" />
            Appointment Details
          </h2>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="font-semibold">Patient:</span>
                <span>{selectedAppointment.patient_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                <span className="font-semibold">Doctor:</span>
                <span>{selectedAppointment.doctor_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-500" />
                <span className="font-semibold">Date:</span>
                <span>{selectedAppointment.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">Time:</span>
                <span>{selectedAppointment.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  selectedAppointment.status === 'Scheduled' ? 'bg-green-100 text-green-800' :
                  selectedAppointment.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-gray-200 text-gray-800'
                }`}>
                  {selectedAppointment.status}
                </span>
              </div>
              <div className="flex items-start gap-2 bg-gray-50 rounded p-3">
                <span>
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 17v-2a4 4 0 0 1 4-4h4m-6 6h6a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-4a4 4 0 0 0-4 4v2a2 2 0 0 0 2 2z"/></svg>
                </span>
                <div>
                  <span className="font-semibold">Notes:</span>
                  <div className="text-gray-700">{selectedAppointment.notes || <span className="italic text-gray-400">No notes</span>}</div>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end mt-6">
            <button className="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" onClick={() => setShowAppointmentModal(false)}>
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Appointments; 