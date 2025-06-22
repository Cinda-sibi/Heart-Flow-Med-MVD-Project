import React, { useEffect, useState } from 'react';
import { createDoctorAvailability, createDoctorLeave } from '../../../apis/DoctorDashboardApis';
import { getAllDoctors } from '../../../apis/AdministrativeStaffDashboardApis';

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
        // If the response is wrapped (e.g., { message, data }), extract data
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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-bold mb-4">Create Doctor Availability</h2>
      <form onSubmit={handleAvailabilitySubmit} className="space-y-4 mb-8">
        <div>
          <label className="block mb-1 font-medium">Doctor</label>
          <select
            name="doctor"
            value={availabilityForm.doctor}
            onChange={handleAvailabilityChange}
            className="w-full border rounded px-3 py-2"
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
          <label className="block mb-1 font-medium">Day of Week</label>
          <select
            name="day_of_week"
            value={availabilityForm.day_of_week}
            onChange={handleAvailabilityChange}
            className="w-full border rounded px-3 py-2"
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
            <label className="block mb-1 font-medium">Start Time</label>
            <input
              type="time"
              name="start_time"
              value={availabilityForm.start_time}
              onChange={handleAvailabilityChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 font-medium">End Time</label>
            <input
              type="time"
              name="end_time"
              value={availabilityForm.end_time}
              onChange={handleAvailabilityChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Create Availability'}
        </button>
      </form>

      <h2 className="text-2xl font-bold mb-4">Add Doctor Leave</h2>
      <form onSubmit={handleLeaveSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Doctor</label>
          <select
            name="doctor"
            value={leaveForm.doctor}
            onChange={handleLeaveChange}
            className="w-full border rounded px-3 py-2"
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
          <label className="block mb-1 font-medium">Date</label>
          <input
            type="date"
            name="date"
            value={leaveForm.date}
            onChange={handleLeaveChange}
            className="w-full border rounded px-3 py-2"
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
            className="w-full border rounded px-3 py-2"
            placeholder="Reason for leave"
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Add Leave'}
        </button>
      </form>
      {(message || error) && (
        <div className={`mt-4 p-3 rounded ${message ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message || error}
        </div>
      )}
    </div>
  );
};

export default CreateDoctorAvailability;
