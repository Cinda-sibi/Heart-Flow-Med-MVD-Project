import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import Modal from "../../../components/layout/Modal";
import { getAllPatients, addPatient, searchPatient, getPatientById } from '../../../apis/AdministrativeStaffDashboardApis';

const PatientsRecord = () => {
  const [patients, setPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    gender: '',
    age: '',
    medical_reference_no: '',
    id_records: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchName, setSearchName] = useState("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewPatient, setViewPatient] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState('');

  // Fetch patients on mount
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllPatients();
      const patientList = Array.isArray(data.data) ? data.data : [];
      setAllPatients(patientList);
      setPatients(patientList);
    } catch (err) {
      setError('Failed to load patients.');
      setPatients([]);
      setAllPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setForm({
      first_name: '',
      last_name: '',
      email: '',
      gender: '',
      age: '',
      medical_reference_no: '',
      id_records: null
    });
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await addPatient(form);
      setSuccess('Patient added successfully!');
      fetchPatients();
      setTimeout(() => {
        closeModal();
      }, 1000);
    } catch (err) {
      console.error('Add patient error:', err);
      let message = 'Failed to add patient.';
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          message = err.response.data;
        } else if (err.response.data.detail) {
          message = err.response.data.detail;
        } else if (typeof err.response.data === 'object') {
          const firstKey = Object.keys(err.response.data)[0];
          if (firstKey) {
            message = `${firstKey}: ${err.response.data[firstKey]}`;
          }
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchName.trim()) return;
    const filtered = allPatients.filter((p) => {
      const name = (p.first_name && p.last_name)
        ? `${p.first_name} ${p.last_name}`
        : p.name || p.full_name || p.username || '';
      return name.toLowerCase().includes(searchName.trim().toLowerCase());
    });
    setPatients(filtered);
  };

  const handleClearSearch = () => {
    setSearchName("");
    setPatients(allPatients);
  };

  const handleViewPatient = async (id) => {
    setViewLoading(true);
    setViewError('');
    setViewPatient(null);
    setViewModalOpen(true);
    try {
      const res = await getPatientById(id);
      if (res && res.status) {
        setViewPatient(res.data);
      } else {
        setViewError('Failed to fetch patient details.');
      }
    } catch (err) {
      setViewError('Failed to fetch patient details.');
    } finally {
      setViewLoading(false);
    }
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setViewPatient(null);
    setViewError('');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Patients</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" onClick={openModal}>
          Add Patient
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          className="border rounded px-3 py-2 w-full max-w-xs"
          placeholder="Search by name..."
          value={searchName}
          onChange={e => setSearchName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
          disabled={loading}
        />
        <button
          className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
          onClick={handleSearch}
          disabled={loading || !searchName.trim()}
        >
          Search
        </button>
        <button
          className="bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300"
          onClick={handleClearSearch}
          disabled={loading || !searchName.trim()}
        >
          Clear
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DOB</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.map((p) => (
                <tr
                  key={p.id || p.user_id}
                  className="cursor-pointer hover:bg-blue-50 transition"
                  onClick={() => handleViewPatient(p.id || p.user_id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <User className="h-10 w-10 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {(p.first_name && p.last_name) ? `${p.first_name} ${p.last_name}` : p.name || p.full_name || p.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.unique_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.phone || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.date_of_birth}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.country || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {/* Future: Edit/Delete buttons */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Patient Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2 className="text-xl font-bold mb-4">Add Patient</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input type="text" name="first_name" value={form.first_name} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter first name" required disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input type="text" name="last_name" value={form.last_name} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter last name" required disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter email" required disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="w-full border rounded px-3 py-2" required disabled={loading}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Age</label>
              <input type="number" name="age" value={form.age} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter age" required disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Medical Reference No</label>
              <input type="text" name="medical_reference_no" value={form.medical_reference_no} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter medical reference no" required disabled={loading} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">ID Records (Upload file)</label>
              <input type="file" name="id_records" accept=".pdf,.jpg,.jpeg,.png" onChange={handleChange} className="w-full border rounded px-3 py-2" disabled={loading} />
            </div>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <div className="flex justify-end">
            <button type="button" className="mr-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300" onClick={closeModal} disabled={loading}>Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700" disabled={loading}>{loading ? 'Adding...' : 'Add Patient'}</button>
          </div>
        </form>
      </Modal>

      {/* View Patient Modal */}
      <Modal isOpen={viewModalOpen} onClose={closeViewModal}>
        <div className="rounded-lg overflow-hidden shadow-lg bg-white max-w-md mx-auto">
          <div className="bg-blue-600 px-6 py-4 flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-10 w-10 text-blue-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-0">
                {viewPatient?.user?.first_name} {viewPatient?.user?.last_name}
              </h2>
              <div className="text-blue-100 text-sm">Patient ID: {viewPatient?.unique_id}</div>
            </div>
          </div>
          <div className="px-6 py-6">
            {viewLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : viewError ? (
              <div className="text-red-600 text-center text-sm">{viewError}</div>
            ) : viewPatient ? (
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-500 text-xs">Email</div>
                  <div className="font-medium">{viewPatient.user?.email}</div>
                  <div className="text-gray-500 text-xs">Role</div>
                  <div className="font-medium">{viewPatient.user?.role}</div>
                  <div className="text-gray-500 text-xs">Phone</div>
                  <div className="font-medium">{viewPatient.user?.phone || '-'}</div>
                  <div className="text-gray-500 text-xs">Date of Birth</div>
                  <div className="font-medium">{viewPatient.date_of_birth}</div>
                  <div className="text-gray-500 text-xs">Gender</div>
                  <div className="font-medium">{viewPatient.gender}</div>
                  <div className="text-gray-500 text-xs">Age</div>
                  <div className="font-medium">{viewPatient.age || '-'}</div>
                  <div className="text-gray-500 text-xs">Country</div>
                  <div className="font-medium">{viewPatient.country || '-'}</div>
                </div>
                <div className="border-t pt-4 mt-2">
                  <div className="text-gray-700 font-semibold mb-2">Contact & Insurance</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-gray-500 text-xs">Address</div>
                    <div className="font-medium">{viewPatient.address}</div>
                    <div className="text-gray-500 text-xs">Emergency Contact</div>
                    <div className="font-medium">{viewPatient.emergency_contact}</div>
                    <div className="text-gray-500 text-xs">Insurance Provider</div>
                    <div className="font-medium">{viewPatient.insurance_provider}</div>
                    <div className="text-gray-500 text-xs">Insurance ID</div>
                    <div className="font-medium">{viewPatient.insurance_id}</div>
                  </div>
                </div>
                <div className="border-t pt-4 mt-2">
                  <div className="text-gray-700 font-semibold mb-2">Allergies</div>
                  <div className="font-medium">{Array.isArray(viewPatient.allergies) && viewPatient.allergies.length > 0 ? viewPatient.allergies.join(', ') : '-'}</div>
                </div>
              </div>
            ) : null}
          </div>
          <div className="bg-gray-50 px-6 py-3 flex justify-end">
            <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition" onClick={closeViewModal}>Close</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PatientsRecord; 