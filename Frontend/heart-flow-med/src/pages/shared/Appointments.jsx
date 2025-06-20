import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MapPin, Edit3, Trash2 } from 'lucide-react';
import Modal from "../../components/layout/Modal";
import { getAllDoctors, getAllPatients, bookAppointment, getAllDoctorAvailabilities, getAllAppointments, searchDoctorAvailability, editAppointment, cancelAppointment } from '../../apis/AdministrativeStaffDashboardApis';
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
        // Convert all availabilities to calendar events
        const events = avails.flatMap((a) => {
          // Find doctor name
          const doc = docs.find(d => (d.user_id || d.id) === (a.doctor_id || a.doctor));
          const doctorName = doc ? ((doc.first_name && doc.last_name) ? `Dr. ${doc.first_name} ${doc.last_name}` : doc.name || doc.full_name || doc.username) : 'Doctor';
          // Generate events for next 2 weeks
          const daysMap = {
            'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 0
          };
          const today = new Date();
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
                resource: { ...a, doctorName },
                doctorId: a.doctor_id || a.doctor
              });
            }
          }
          return events;
        });
        setCalendarEvents(events);
        // Set appointments from API
        setAppointments(Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Appointments</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" onClick={openModal}>
          New Appointment
        </button>
      </div>

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
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
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
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {appointment.type || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {appointment.status || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="h-4 w-4 mr-2" />
                      {appointment.location || '-'}
                    </div>
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
              onChange={(e) => {
                setForm({ ...form, doctor: e.target.value });
                setSelectedDoctor(e.target.value);
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
              onChange={(e) => {
                setForm({ ...form, doctor: e.target.value });
                setSelectedDoctor(e.target.value);
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
    </div>
  );
};

export default Appointments; 