import React, { useEffect, useState } from 'react';
import { fetchAllSonographers, assignPatientToSonographer } from '../../../apis/DoctorDashboardApis';
import { getAllPatients } from '../../../apis/AdministrativeStaffDashboardApis';
import { CheckCircle, User } from 'lucide-react';

const getInitials = (first, last) => {
  if (!first && !last) return '?';
  return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
};

const AssiginingToSonographers = () => {
  const [sonographers, setSonographers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedSonographer, setSelectedSonographer] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reason, setReason] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const sonographerRes = await fetchAllSonographers();
        setSonographers(sonographerRes.data || []);
        const patientRes = await getAllPatients();
        setPatients(patientRes.data || []);
      } catch (err) {
        setError('Failed to fetch sonographers or patients');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAssign = async () => {
    if (!selectedSonographer || !selectedPatient || !reason) return;
    setLoading(true);
    setError('');
    setSuccess('');
    setFieldErrors({});
    try {
      await assignPatientToSonographer({
        patient: selectedPatient.user_id,
        sonographer: selectedSonographer.id,
        reason,
      });
      setSuccess(`Assigned patient ${selectedPatient.first_name} to sonographer ${selectedSonographer.first_name}`);
      setReason('');
      setSelectedPatient(null);
      setSelectedSonographer(null);
    } catch (err) {
      const backend = err.response?.data;
      if (backend && backend.message) {
        setFieldErrors(backend.message);
      } else {
        setError('Failed to assign patient to sonographer');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-6 text-center">Assign Patients to Sonographers</h2>
      {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4 text-center">{success}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sonographers */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Available Sonographers</h3>
          <div className="flex flex-col gap-3">
            {sonographers.length === 0 && <div className="text-gray-500">No sonographers found.</div>}
            {sonographers.map((s) => (
              <div
                key={s.id}
                className={`flex items-center gap-4 p-4 rounded-lg border shadow-sm cursor-pointer transition-all duration-150 ${selectedSonographer?.id === s.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'hover:bg-blue-50'}`}
                onClick={() => setSelectedSonographer(s)}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-200 text-blue-800 font-bold text-lg">
                  {getInitials(s.first_name, s.last_name)}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{s.first_name} {s.last_name}</div>
                  <div className="text-gray-600 text-sm">{s.email}</div>
                </div>
                {selectedSonographer?.id === s.id && <CheckCircle className="text-blue-500" />}
              </div>
            ))}
          </div>
        </div>
        {/* Patients */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Patients</h3>
          <div className="flex flex-col gap-3">
            {patients.length === 0 && <div className="text-gray-500">No patients found.</div>}
            {patients.map((p) => (
              <div
                key={p.id}
                className={`flex items-center gap-4 p-4 rounded-lg border shadow-sm cursor-pointer transition-all duration-150 ${selectedPatient?.id === p.id ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'hover:bg-green-50'}`}
                onClick={() => setSelectedPatient(p)}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-200 text-green-800 font-bold text-lg">
                  {getInitials(p.first_name, p.last_name)}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{p.first_name} {p.last_name}</div>
                  <div className="text-gray-600 text-sm">{p.email}</div>
                </div>
                {selectedPatient?.id === p.id && <CheckCircle className="text-green-500" />}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Referral Reason */}
      <div className="mt-8 max-w-xl mx-auto">
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason for Referral<span className="text-red-500">*</span></label>
        <textarea
          id="reason"
          name="reason"
          className="block w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          rows={3}
          value={reason}
          onChange={e => setReason(e.target.value)}
          required
        />
        {fieldErrors.reason && (
          <div className="text-red-500 text-sm mt-1">{Array.isArray(fieldErrors.reason) ? fieldErrors.reason.join(', ') : fieldErrors.reason}</div>
        )}
      </div>
      {/* Assign Button */}
      <div className="mt-8 flex justify-center">
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-lg shadow hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
          disabled={!selectedSonographer || !selectedPatient || !reason || loading}
          onClick={handleAssign}
        >
          {loading && <span className="loader border-white border-2 border-t-blue-500 mr-2 animate-spin rounded-full w-5 h-5"></span>}
          Assign Patient to Sonographer
        </button>
      </div>
      {fieldErrors.patient && (
        <div className="text-red-500 text-sm mt-2 text-center">{Array.isArray(fieldErrors.patient) ? fieldErrors.patient.join(', ') : fieldErrors.patient}</div>
      )}
    </div>
  );
};

export default AssiginingToSonographers;

// Add this to your global CSS or Tailwind config for the loader if not present:
// .loader { border-radius: 9999px; border-width: 2px; border-style: solid; border-top-color: #3b82f6; border-right-color: transparent; border-bottom-color: transparent; border-left-color: transparent; }
