import React, { useEffect, useState } from 'react';
import { fetchAllSonographers, assignPatientToSonographer } from '../../../apis/DoctorDashboardApis';
import { getAllPatients } from '../../../apis/AdministrativeStaffDashboardApis';

const AssiginingToSonographers = () => {
  const [sonographers, setSonographers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedSonographer, setSelectedSonographer] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    if (!selectedSonographer || !selectedPatient) return;
    setLoading(true);
    setError('');
    try {
      await assignPatientToSonographer({
        patient_id: selectedPatient.id,
        sonographer_id: selectedSonographer.id,
      });
      alert(`Assigned patient ${selectedPatient.first_name} to sonographer ${selectedSonographer.first_name}`);
    } catch (err) {
      setError('Failed to assign patient to sonographer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Assign Patients to Sonographers</h2>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="text-xl font-semibold mb-2">Available Sonographers</h3>
          <ul className="border rounded p-2 max-h-64 overflow-y-auto">
            {sonographers.length === 0 && <li>No sonographers found.</li>}
            {sonographers.map((s) => (
              <li
                key={s.id}
                className={`p-2 cursor-pointer rounded ${selectedSonographer?.id === s.id ? 'bg-blue-100' : ''}`}
                onClick={() => setSelectedSonographer(s)}
              >
                {s.first_name} {s.last_name} ({s.email})
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Patients</h3>
          <ul className="border rounded p-2 max-h-64 overflow-y-auto">
            {patients.length === 0 && <li>No patients found.</li>}
            {patients.map((p) => (
              <li
                key={p.id}
                className={`p-2 cursor-pointer rounded ${selectedPatient?.id === p.id ? 'bg-green-100' : ''}`}
                onClick={() => setSelectedPatient(p)}
              >
                {p.first_name} {p.last_name} ({p.email})
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-6">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={!selectedSonographer || !selectedPatient}
          onClick={handleAssign}
        >
          Assign Patient to Sonographer
        </button>
      </div>
    </div>
  );
};

export default AssiginingToSonographers;
