import React, { useEffect, useState } from 'react';
import { createDoctorAvailability, createDoctorLeave } from '../../../apis/DoctorDashboardApis';
import { getAllDoctors } from '../../../apis/AdministrativeStaffDashboardApis';
import { Calendar, Sun } from 'lucide-react';

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
    fetchDoctors();
  }, []);

  const handleAvailabilityChange = (e) => {
    setAvailabilityForm({ ...availabilityForm, [e.target.name]: e.target.value });
  };

  const handleLeaveChange = (e) => {
    setLeaveForm({ ...leaveForm, [e.target.name]: e.target.value });
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
      await createDoctorAvailability(availabilityForm);
      setMessage('Doctor availability created successfully!');
      setAvailabilityForm({ doctor: '', day_of_week: '', start_time: '', end_time: '' });
    } catch (err) {
      setError('Failed to create doctor availability');
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
    <div className="max-w-2xl mx-auto mt-10 space-y-10">
      {/* Feedback Message */}
      {(message || error) && (
        <div className={`fixed top-6 right-6 z-50 px-4 py-3 rounded shadow-lg flex items-center gap-4 ${message ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <span>{message || error}</span>
          <button onClick={() => { setMessage(''); setError(''); }} className="ml-2 text-lg font-bold">&times;</button>
        </div>
      )}
      {/* Doctor Availability Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="inline-block bg-blue-100 text-blue-600 rounded-full p-2">
            <Calendar className="w-5 h-5" />
          </span>
          Create Doctor Availability
        </h2>
        <form onSubmit={handleAvailabilitySubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-medium">Doctor <span className="text-red-500">*</span></label>
            <select
              name="doctor"
              value={availabilityForm.doctor}
              onChange={handleAvailabilityChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
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
          <div>
            <label className="block mb-1 font-medium">Day of Week <span className="text-red-500">*</span></label>
            <select
              name="day_of_week"
              value={availabilityForm.day_of_week}
              onChange={handleAvailabilityChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              required
            >
              <option value="">Select Day</option>
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-1 font-medium">Start Time <span className="text-red-500">*</span></label>
              <input
                type="time"
                name="start_time"
                value={availabilityForm.start_time}
                onChange={handleAvailabilityChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-medium">End Time <span className="text-red-500">*</span></label>
              <input
                type="time"
                name="end_time"
                value={availabilityForm.end_time}
                onChange={handleAvailabilityChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg mt-2 hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Create Availability'}
          </button>
        </form>
      </div>
      {/* Doctor Leave Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span className="inline-block bg-green-100 text-green-600 rounded-full p-2">
            <Sun className="w-5 h-5" />
          </span>
          Add Doctor Leave
        </h2>
        <form onSubmit={handleLeaveSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-medium">Doctor <span className="text-red-500">*</span></label>
            <select
              name="doctor"
              value={leaveForm.doctor}
              onChange={handleLeaveChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-200 focus:border-green-400 transition"
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
          <div>
            <label className="block mb-1 font-medium">Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="date"
              value={leaveForm.date}
              onChange={handleLeaveChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-200 focus:border-green-400 transition"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Reason (optional)</label>
            <input
              type="text"
              name="reason"
              value={leaveForm.reason}
              onChange={handleLeaveChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-200 focus:border-green-400 transition"
              placeholder="Reason for leave"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-semibold py-2 rounded-lg mt-2 hover:bg-green-700 transition"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Add Leave'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateDoctorAvailability;
