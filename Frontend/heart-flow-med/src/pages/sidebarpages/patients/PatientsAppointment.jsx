import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, AlertCircle, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import * as PatientsDashboardApis from '../../../apis/PatientsDashboardApis';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';

const locales = { 'en-US': enUS };
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

const PatientsAppointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Doctor availability state
  const [availabilities, setAvailabilities] = useState([]);
  const [availLoading, setAvailLoading] = useState(true);
  const [availError, setAvailError] = useState(null);

  // Booking modal state
  const [showModal, setShowModal] = useState(false);
  const [booking, setBooking] = useState({ doctor: '', date: '', time: '', notes: '' });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // New state for calendar/modal
  const [viewMode, setViewMode] = useState('table');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDayAppointments, setSelectedDayAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');

  // For doctor availabilities in booking modal
  const [allDoctorAvailabilities, setAllDoctorAvailabilities] = useState([]);
  const [selectedDoctorAvailability, setSelectedDoctorAvailability] = useState([]);

  useEffect(() => {
    fetchAppointments();
    fetchAvailabilities();
    fetchAllDoctorAvailabilities();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const appointmentData = await PatientsDashboardApis.listPatientAppointments();
      // Sort appointments by date, most recent first
      const sortedAppointments = appointmentData.sort((a, b) => 
        new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time)
      );
      setAppointments(sortedAppointments);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailabilities = async () => {
    try {
      setAvailLoading(true);
      const res = await PatientsDashboardApis.listDoctorAvailabilities();
      setAvailabilities(Array.isArray(res.data) ? res.data : []);
      setAvailError(null);
    } catch (err) {
      setAvailError('Failed to fetch doctor availabilities');
      setAvailabilities([]);
    } finally {
      setAvailLoading(false);
    }
  };

  const fetchAllDoctorAvailabilities = async () => {
    try {
      const res = await PatientsDashboardApis.listAllDoctorAvailabilities();
      setAllDoctorAvailabilities(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setAllDoctorAvailabilities([]);
    }
  };

  useEffect(() => {
    if (booking.doctor) {
      const found = allDoctorAvailabilities.find(d => String(d.doctor_id) === String(booking.doctor));
      setSelectedDoctorAvailability(found ? found.availabilities : []);
    } else {
      setSelectedDoctorAvailability([]);
    }
  }, [booking.doctor, allDoctorAvailabilities]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    return new Date('2000-01-01 ' + timeStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Booking handlers
  const openModal = () => {
    setShowModal(true);
    setBooking({ doctor: '', date: '', time: '', notes: '' });
    setBookingError(null);
    setBookingSuccess(null);
  };
  const closeModal = () => {
    setShowModal(false);
    setBookingError(null);
    setBookingSuccess(null);
  };
  const handleBookingChange = (e) => {
    setBooking({ ...booking, [e.target.name]: e.target.value });
  };
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError(null);
    setBookingSuccess(null);
    try {
      await PatientsDashboardApis.bookAppointment({
        doctor: booking.doctor,
        date: booking.date,
        time: booking.time,
        notes: booking.notes,
      });
      setBookingSuccess('Appointment booked successfully!');
      fetchAppointments();
      setTimeout(() => {
        closeModal();
      }, 1000);
    } catch (err) {
      setBookingError(err?.response?.data?.message || 'Failed to book appointment.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Map appointments to calendar events
  const calendarEvents = appointments.map(appt => {
    let start = new Date();
    let end = new Date();
    try {
      const dateStr = appt.date;
      const timeStr = appt.time || '09:00';
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hour, minute] = timeStr.split(':').map(Number);
      start = new Date(year, month - 1, day, hour, minute);
      end = new Date(start.getTime() + 30 * 60000);
    } catch (e) {
      start = new Date();
      end = new Date(start.getTime() + 30 * 60000);
    }
    return {
      id: appt.id,
      title: 'Dr. ' + appt.doctor_name + (appt.status ? ` (${appt.status})` : ''),
      start,
      end,
      resource: appt,
    };
  });

  const appointmentsByDate = {};
  appointments.forEach(appt => {
    const dateKey = appt.date;
    if (!appointmentsByDate[dateKey]) appointmentsByDate[dateKey] = [];
    appointmentsByDate[dateKey].push(appt);
  });

  const CustomMonthDateCell = ({ date }) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const appts = appointmentsByDate[dateKey] || [];
    const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    return (
      <div
        className={`relative h-full min-h-[80px] p-1 rounded-lg cursor-pointer transition-colors duration-150 ${isToday ? 'border-2 border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
        onClick={e => {
          e.stopPropagation();
          setSelectedDayAppointments(appts);
          setSelectedDate(dateKey);
          setModalOpen(true);
        }}
        title={`Appointments for ${dateKey}`}
      >
        <div className="absolute top-1 right-2 text-xs font-bold text-gray-400">{date.getDate()}</div>
        <div className="flex flex-col gap-1 mt-5">
          {appts.length === 0 ? (
            <div className="text-xs text-gray-300 italic">No appointments</div>
          ) : (
            appts.slice(0, 2).map(appt => (
              <div
                key={appt.id}
                className={`truncate px-2 py-1 rounded text-xs font-medium cursor-pointer
                  ${appt.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}
                `}
                title={`Dr. ${appt.doctor_name} (${appt.time})`}
              >
                Dr. {appt.doctor_name} <span className="font-normal text-gray-500">({appt.time})</span>
              </div>
            ))
          )}
          {appts.length > 2 && (
            <div className="text-xs text-blue-600 mt-1">+{appts.length - 2} more</div>
          )}
        </div>
      </div>
    );
  };

  const AppointmentsModal = ({ open, onClose, appointments, date }) => {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl font-bold"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
          <h2 className="text-lg font-semibold mb-4 text-center">Appointments for {date}</h2>
          {appointments.length === 0 ? (
            <div className="text-gray-500 text-center">No appointments found.</div>
          ) : (
            <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
              {appointments.map(appt => (
                <li key={appt.id} className="py-3">
                  <div className="font-medium text-gray-900">Dr. {appt.doctor_name}</div>
                  <div className="text-sm text-gray-600">Time: {appt.time}</div>
                  <div className="text-xs text-gray-500">Status: {appt.status}</div>
                  <div className="text-xs text-gray-500">Notes: {appt.notes || '-'}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600">View all your scheduled and past appointments</p>
        </div>
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          onClick={openModal}
        >
          <Plus className="h-5 w-5" /> Book Appointment
        </button>
      </div>
      {/* Toggle for Table/Calendar View */}
      <div className="mb-4 flex gap-2">
        <button
          className={`px-4 py-2 rounded ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setViewMode('table')}
        >
          Table View
        </button>
        <button
          className={`px-4 py-2 rounded ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          onClick={() => setViewMode('calendar')}
        >
          Calendar View
        </button>
      </div>
      {/* Doctor Availabilities Table (Table View Only) */}
      {viewMode === 'table' && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-2">Doctor Availabilities</h2>
          {availLoading ? (
            <div>Loading doctor availabilities...</div>
          ) : availError ? (
            <div className="text-red-600">{availError}</div>
          ) : allDoctorAvailabilities.length === 0 ? (
            <div className="text-gray-500">No availabilities found.</div>
          ) : (
            <div className="space-y-6">
              {allDoctorAvailabilities.map((doctor) => (
                <div key={doctor.doctor_id} className="bg-white rounded shadow p-4">
                  <div className="font-bold text-blue-700 mb-2">Dr. {doctor.doctor_name}</div>
                  {doctor.availabilities.length === 0 ? (
                    <div className="text-gray-500 text-sm">No availabilities listed.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 mb-2">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Start Time</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">End Time</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {doctor.availabilities.map((slot, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-2">{slot.day}</td>
                              <td className="px-4 py-2">{slot.start_time}</td>
                              <td className="px-4 py-2">{slot.end_time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
              onClick={closeModal}
              title="Close"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-bold mb-4">Book Appointment</h2>
            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Doctor</label>
                <select
                  name="doctor"
                  value={booking.doctor}
                  onChange={handleBookingChange}
                  className="w-full border rounded px-3 py-2"
                  required
                  disabled={bookingLoading}
                >
                  <option value="">Select Doctor</option>
                  {allDoctorAvailabilities.map((d) => (
                    <option key={d.doctor_id} value={d.doctor_id}>
                      {d.doctor_name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Show selected doctor's availabilities */}
              {selectedDoctorAvailability.length > 0 && (
                <div className="bg-blue-50 rounded p-2 mb-2">
                  <div className="font-semibold text-blue-700 mb-1 text-sm">Doctor's Availability:</div>
                  <ul className="text-xs text-blue-900 space-y-1">
                    {selectedDoctorAvailability.map((slot, idx) => (
                      <li key={idx}>
                        {slot.day}: {slot.start_time} - {slot.end_time}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={booking.date}
                  onChange={handleBookingChange}
                  className="w-full border rounded px-3 py-2"
                  required
                  disabled={bookingLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input
                  type="time"
                  name="time"
                  value={booking.time}
                  onChange={handleBookingChange}
                  className="w-full border rounded px-3 py-2"
                  required
                  disabled={bookingLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={booking.notes}
                  onChange={handleBookingChange}
                  className="w-full border rounded px-3 py-2"
                  rows={2}
                  disabled={bookingLoading}
                />
              </div>
              {bookingError && <div className="text-red-600 text-sm">{bookingError}</div>}
              {bookingSuccess && <div className="text-green-600 text-sm">{bookingSuccess}</div>}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="mr-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                  onClick={closeModal}
                  disabled={bookingLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  disabled={bookingLoading}
                >
                  {bookingLoading ? 'Booking...' : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Appointments Table or Calendar */}
      {viewMode === 'table' ? (
        loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Appointments Found</h3>
            <p className="text-gray-600 mt-1">You don't have any appointments scheduled yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Appointment with Dr. {appointment.doctor_name}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{formatDate(appointment.date)} at {formatTime(appointment.time)}</span>
                          </div>
                          {appointment.notes && (
                            <div className="flex items-start text-gray-600">
                              <FileText className="h-4 w-4 mr-2 mt-1" />
                              <span className="text-sm">{appointment.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="bg-white rounded-lg shadow p-4">
          <BigCalendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            views={['month']}
            defaultView="month"
            components={{
              toolbar: CustomToolbar,
              event: ({ event }) => (
                <span>
                  <b>{event.title}</b>
                  {event.resource && event.resource.notes ? <div className="text-xs text-gray-500">{event.resource.notes}</div> : null}
                </span>
              ),
              month: {
                dateHeader: CustomMonthDateCell,
              },
            }}
          />
        </div>
      )}
      <AppointmentsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        appointments={selectedDayAppointments}
        date={selectedDate}
      />
    </div>
  );
};

export default PatientsAppointment;
