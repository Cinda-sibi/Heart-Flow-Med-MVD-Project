import React, { useState, useEffect } from "react";
import { Calendar, Activity, User, Clock } from 'lucide-react';
import axiosInstance from '../../../config/axiosInstance';

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

const DoctorAdminPanel = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorIdAvailability, setSelectedDoctorIdAvailability] = useState("");
  const [selectedDoctorIdLeave, setSelectedDoctorIdLeave] = useState("");
  const [selectedDoctorIdCheck, setSelectedDoctorIdCheck] = useState("");
  const [day, setDay] = useState("Monday");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [leaveDate, setLeaveDate] = useState("");
  const [availabilityCheck, setAvailabilityCheck] = useState({});

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axiosInstance.get("/list-all-doctors/");
        if (res.data && res.data.data) {
          setDoctors(res.data.data);
        }
      } catch (err) {
        alert("Error fetching doctors");
      }
    };
    fetchDoctors();
  }, []);

  const handleAddAvailability = async () => {
    try {
      const res = await axiosInstance.post("/create-list-doctor-availability/", {
        doctor: selectedDoctorIdAvailability,
        day_of_week: day,
        start_time: startTime,
        end_time: endTime,
      });
      alert("Availability added");
    } catch (err) {
      alert("Error adding availability");
    }
  };

  const handleAddLeave = async () => {
    try {
      const res = await axiosInstance.post("/doctor-leave/", {
        doctor: selectedDoctorIdLeave,
        date: leaveDate,
      });
      alert("Leave added");
    } catch (err) {
      alert("Error adding leave");
    }
  };

  const handleCheckAvailability = async () => {
    try {
      const date = prompt("Enter date (YYYY-MM-DD):");
      const time = prompt("Enter time (HH:MM):");
      const res = await axiosInstance.post("/check-doctor-availability/", {
        doctor_id: selectedDoctorIdCheck,
        date: date,
        time: time,
      });
      setAvailabilityCheck(res.data);
    } catch (err) {
      alert("Error checking availability");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Doctor Availability Management</h1>
        <p className="text-gray-600">Manage doctor schedules, leaves, and check availability.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoCard title="Add Availability" icon={Activity} color="blue">
          <div className="space-y-2">
            <select
              value={selectedDoctorIdAvailability}
              onChange={(e) => setSelectedDoctorIdAvailability(e.target.value)}
              className="border p-2 w-full rounded mb-2"
            >
              <option value="">Select Doctor</option>
              {doctors.map((doc) => (
                <option key={doc.user_id} value={doc.user_id}>
                  {doc.first_name} {doc.last_name} ({doc.email})
                </option>
              ))}
            </select>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="border p-2 w-full rounded mb-2"
            >
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time (AM/PM)</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="border p-2 w-full rounded"
                  placeholder="09:00"
                />
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time (AM/PM)</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="border p-2 w-full rounded"
                  placeholder="05:00"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Please use 12-hour format and select AM/PM if available.</p>
            <button
              onClick={handleAddAvailability}
              className="bg-blue-600 text-white px-4 py-2 rounded mt-2 w-full"
            >
              Add Availability
            </button>
          </div>
        </InfoCard>

        <InfoCard title="Add Leave" icon={Calendar} color="red">
          <div className="space-y-2">
            <select
              value={selectedDoctorIdLeave}
              onChange={(e) => setSelectedDoctorIdLeave(e.target.value)}
              className="border p-2 w-full rounded mb-2"
            >
              <option value="">Select Doctor</option>
              {doctors.map((doc) => (
                <option key={doc.user_id} value={doc.user_id}>
                  {doc.first_name} {doc.last_name} ({doc.email})
                </option>
              ))}
            </select>
            <input
              type="date"
              value={leaveDate}
              onChange={(e) => setLeaveDate(e.target.value)}
              className="border p-2 w-full rounded mb-2"
            />
            <button
              onClick={handleAddLeave}
              className="bg-red-600 text-white px-4 py-2 rounded w-full"
            >
              Add Leave
            </button>
          </div>
        </InfoCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InfoCard title="Check Availability" icon={Clock} color="green">
          <div className="space-y-2">
            <select
              value={selectedDoctorIdCheck}
              onChange={(e) => setSelectedDoctorIdCheck(e.target.value)}
              className="border p-2 w-full rounded mb-2"
            >
              <option value="">Select Doctor</option>
              {doctors.map((doc) => (
                <option key={doc.user_id} value={doc.user_id}>
                  {doc.first_name} {doc.last_name} ({doc.email})
                </option>
              ))}
            </select>
            <button
              onClick={handleCheckAvailability}
              className="bg-green-600 text-white px-4 py-2 rounded w-full"
            >
              Check Doctor Availability
            </button>
            {availabilityCheck.message && (
              <div className="p-2 border rounded bg-gray-100 mt-2">
                <strong>{availabilityCheck.available ? "✅ Available" : "❌ Not Available"}</strong><br />
                {availabilityCheck.message || availabilityCheck.reason}
              </div>
            )}
          </div>
        </InfoCard>
      </div>
    </div>
  );
};

export default DoctorAdminPanel;
