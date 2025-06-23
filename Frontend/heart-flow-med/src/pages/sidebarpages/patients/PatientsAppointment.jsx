import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, AlertCircle, Plus, X } from 'lucide-react';
import * as PatientsDashboardApis from '../../../apis/PatientsDashboardApis';

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

  useEffect(() => {
    fetchAppointments();
    fetchAvailabilities();
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

      {/* Doctor Availabilities */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Doctor Availabilities</h2>
        {availLoading ? (
          <div>Loading doctor availabilities...</div>
        ) : availError ? (
          <div className="text-red-600">{availError}</div>
        ) : availabilities.length === 0 ? (
          <div className="text-gray-500">No availabilities found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 mb-4">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Start Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">End Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {availabilities.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-2">{a.doctor_full_name || a.doctor || '-'}</td>
                    <td className="px-4 py-2">{a.day_of_week}</td>
                    <td className="px-4 py-2">{a.start_time}</td>
                    <td className="px-4 py-2">{a.end_time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
                  {availabilities.map((a) => (
                    <option key={a.id} value={a.doctor_id || a.doctor}>
                      {a.doctor_full_name || a.doctor || '-'}
                    </option>
                  ))}
                </select>
              </div>
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

      {/* Appointments List */}
      {loading ? (
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
      )}
    </div>
  );
};

export default PatientsAppointment;
