import React, { useEffect, useState } from 'react';
import { createDoctorAvailability, createDoctorLeave, fetchDoctorAvailability, updateDoctorAvailability } from '../../../apis/DoctorDashboardApis';
import { getAllDoctors } from '../../../apis/AdministrativeStaffDashboardApis';
import { Calendar, Sun, CheckCircle2, XCircle, Edit2, Loader2, X } from 'lucide-react';

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const CreateDoctorAvailability = () => {
  const [doctors, setDoctors] = useState([]);
  const [availabilityForm, setAvailabilityForm] = useState({
    doctor: '',
    day_of_week: '',
    start_time: '',
    end_time: '',
  });
  const [leaveForm, setLeaveForm] = useState({
    doctor: '',
    date: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [availabilities, setAvailabilities] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await getAllDoctors();
        let doctorsArray = data;
        if (data && typeof data === 'object' && Array.isArray(data.data)) {
          doctorsArray = data.data;
        }
        setDoctors(Array.isArray(doctorsArray) ? doctorsArray : []);
      } catch (err) {
        setError('Failed to fetch doctors');
      }
    };
    const fetchAvailabilities = async () => {
      try {
        const data = await fetchDoctorAvailability();
        setAvailabilities(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchDoctors();
    fetchAvailabilities();
  }, []);

  const handleAvailabilityChange = (e) => {
    setAvailabilityForm({ ...availabilityForm, [e.target.name]: e.target.value });
  };

  const handleLeaveChange = (e) => {
    setLeaveForm({ ...leaveForm, [e.target.name]: e.target.value });
  };

  const handleEditAvailability = (availability) => {
    setAvailabilityForm({
      doctor: availability.doctor || availability.doctor_id || '',
      day_of_week: availability.day_of_week || '',
      start_time: availability.start_time || '',
      end_time: availability.end_time || '',
    });
    setEditingId(availability.id);
    setMessage('');
    setError('');
  };

  const handleAvailabilitySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      if (!availabilityForm.doctor || !availabilityForm.day_of_week || !availabilityForm.start_time || !availabilityForm.end_time) {
        setError('All fields are required for availability');
        setLoading(false);
        return;
      }
      if (editingId) {
        await updateDoctorAvailability(editingId, availabilityForm);
        setMessage('Doctor availability updated successfully!');
      } else {
        await createDoctorAvailability(availabilityForm);
        setMessage('Doctor availability created successfully!');
      }
      setAvailabilityForm({ doctor: '', day_of_week: '', start_time: '', end_time: '' });
      setEditingId(null);
      // Refresh availabilities
      const data = await fetchDoctorAvailability();
      setAvailabilities(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(editingId ? 'Failed to update doctor availability' : 'Failed to create doctor availability');
    }
    setLoading(false);
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      if (!leaveForm.doctor || !leaveForm.date) {
        setError('Doctor and date are required for leave');
        setLoading(false);
        return;
      }
      await createDoctorLeave(leaveForm);
      setMessage('Doctor leave added successfully!');
      setLeaveForm({ doctor: '', date: '', reason: '' });
    } catch (err) {
      setError('Failed to add doctor leave');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-12 px-2 md:px-0">
      {/* Feedback Message */}
      {(message || error) && (
        <div className={`fixed top-8 right-8 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border ${message ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}
          role="alert"
        >
          {message ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
          <span className="font-medium">{message || error}</span>
          <button onClick={() => { setMessage(''); setError(''); }} className="ml-2 text-lg font-bold focus:outline-none"><X /></button>
        </div>
      )}
      {/* Doctor Availability Card */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-8">
          <span className="inline-flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-12 h-12">
            <Calendar className="w-6 h-6" />
          </span>
          <h2 className="text-2xl md:text-2xl font-bold tracking-tight">
            {editingId ? 'Edit Doctor Availability' : 'Create Doctor Availability'}
          </h2>
        </div>
        <form onSubmit={handleAvailabilitySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Doctor <span className="text-red-500">*</span></label>
            <select
              name="doctor"
              value={availabilityForm.doctor}
              onChange={handleAvailabilityChange}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map((doc) => (
                <option key={doc.user_id} value={doc.user_id}>
                  {doc.first_name} {doc.last_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Day of Week <span className="text-red-500">*</span></label>
            <select
              name="day_of_week"
              value={availabilityForm.day_of_week}
              onChange={handleAvailabilityChange}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              required
            >
              <option value="">Select Day</option>
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Start Time <span className="text-red-500">*</span></label>
            <input
              type="time"
              name="start_time"
              value={availabilityForm.start_time}
              onChange={handleAvailabilityChange}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">End Time <span className="text-red-500">*</span></label>
            <input
              type="time"
              name="end_time"
              value={availabilityForm.end_time}
              onChange={handleAvailabilityChange}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              required
            />
          </div>
          <div className="col-span-1 md:col-span-2 flex gap-4 mt-2">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition shadow-md disabled:opacity-60"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (editingId ? <Edit2 className="w-5 h-5" /> : <Calendar className="w-5 h-5" />)}
              {loading ? 'Submitting...' : (editingId ? 'Update Availability' : 'Create Availability')}
            </button>
            {editingId && (
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 bg-gray-400 text-white font-semibold py-2 rounded-lg hover:bg-gray-500 transition shadow-md"
                onClick={() => { setEditingId(null); setAvailabilityForm({ doctor: '', day_of_week: '', start_time: '', end_time: '' }); }}
                disabled={loading}
              >
                <X className="w-5 h-5" /> Cancel Edit
              </button>
            )}
          </div>
        </form>
        {/* List existing availabilities */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold mb-3">Existing Availabilities</h3>
          <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600 uppercase">Day</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600 uppercase">Start Time</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600 uppercase">End Time</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {availabilities.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-400">No availability records found.</td>
                  </tr>
                ) : (
                  availabilities.map((slot, idx) => (
                    <tr key={slot.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-blue-50/40'}>
                      <td className="px-4 py-2">{slot.day_of_week}</td>
                      <td className="px-4 py-2">{slot.start_time}</td>
                      <td className="px-4 py-2">{slot.end_time}</td>
                      <td className="px-4 py-2">
                        <button
                          className="flex items-center gap-1 bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 transition shadow-sm"
                          onClick={() => handleEditAvailability(slot)}
                          type="button"
                        >
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Doctor Leave Card */}
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-8">
          <span className="inline-flex items-center justify-center bg-green-100 text-green-600 rounded-full w-12 h-12">
            <Sun className="w-6 h-6" />
          </span>
          <h2 className="text-2xl md:text-2xl font-bold tracking-tight">Add Doctor Leave</h2>
        </div>
        <form onSubmit={handleLeaveSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Doctor <span className="text-red-500">*</span></label>
            <select
              name="doctor"
              value={leaveForm.doctor}
              onChange={handleLeaveChange}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-200 focus:border-green-400 transition"
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map((doc) => (
                <option key={doc.user_id} value={doc.user_id}>
                  {doc.first_name} {doc.last_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="date"
              value={leaveForm.date}
              onChange={handleLeaveChange}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-200 focus:border-green-400 transition"
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Reason (optional)</label>
            <input
              type="text"
              name="reason"
              value={leaveForm.reason}
              onChange={handleLeaveChange}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-200 focus:border-green-400 transition"
              placeholder="Reason for leave"
            />
          </div>
          <div className="col-span-1 md:col-span-3 flex gap-4 mt-2">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition shadow-md disabled:opacity-60"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sun className="w-5 h-5" />}
              {loading ? 'Submitting...' : 'Add Leave'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDoctorAvailability;
