import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import Modal from "../../../components/layout/Modal";
import { getAllPatients, addPatient, searchPatient } from '../../../apis/AdministrativeStaffDashboardApis';

const PatientsRecord = () => {
  const [patients, setPatients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    emergency_contact: '',
    insurance_provider: '',
    insurance_id: '',
    country: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState({ first_name: '', last_name: '', unique_id: '' });
  const [searching, setSearching] = useState(false);

  // Fetch patients on mount
  useEffect(() => {
    fetchPatients();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (
        search.first_name.trim() ||
        search.last_name.trim() ||
        search.unique_id.trim()
      ) {
        handleSearch();
      } else {
        fetchPatients();
      }
    }, 500);
    return () => clearTimeout(handler);
    // eslint-disable-next-line
  }, [search]);

  const fetchPatients = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllPatients();
      setPatients(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError('Failed to load patients.');
      setPatients([]);
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
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      date_of_birth: '',
      gender: '',
      address: '',
      emergency_contact: '',
      insurance_provider: '',
      insurance_id: '',
      country: '',
      password: ''
    });
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
        user: {
          email: form.email,
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
          role: 'Patient',
          password: form.password
        },
        date_of_birth: form.date_of_birth,
        gender: form.gender,
        address: form.address,
        emergency_contact: form.emergency_contact,
        insurance_provider: form.insurance_provider,
        insurance_id: form.insurance_id,
        country: form.country
      };
      await addPatient(payload);
      setSuccess('Patient added successfully!');
      fetchPatients();
      setTimeout(() => {
        closeModal();
      }, 1000);
    } catch (err) {
      console.error('Add patient error:', err);
      // Try to extract backend error message
      let message = 'Failed to add patient.';
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          message = err.response.data;
        } else if (err.response.data.detail) {
          message = err.response.data.detail;
        } else if (typeof err.response.data === 'object') {
          // Show first error in object
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

  const handleSearchInput = (e) => {
    setSearch({ ...search, [e.target.name]: e.target.value });
  };

  const handleSearch = async () => {
    setSearching(true);
    setError('');
    try {
      const params = {};
      if (search.first_name.trim()) params.first_name = search.first_name.trim();
      if (search.last_name.trim()) params.last_name = search.last_name.trim();
      if (search.unique_id.trim()) params.unique_id = search.unique_id.trim();
      const data = await searchPatient(params);
      setPatients(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError('Failed to search patients.');
      setPatients([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Patients</h1>
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <input
            type="text"
            name="first_name"
            value={search.first_name}
            onChange={handleSearchInput}
            className="border rounded px-3 py-2"
            placeholder="Search by First Name"
            disabled={loading || searching}
          />
          <input
            type="text"
            name="last_name"
            value={search.last_name}
            onChange={handleSearchInput}
            className="border rounded px-3 py-2"
            placeholder="Search by Last Name"
            disabled={loading || searching}
          />
          <input
            type="text"
            name="unique_id"
            value={search.unique_id}
            onChange={handleSearchInput}
            className="border rounded px-3 py-2"
            placeholder="Search by Unique ID"
            disabled={loading || searching}
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" onClick={openModal} disabled={loading || searching}>
            Add Patient
          </button>
        </div>
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
                <tr key={p.id || p.user_id}>
                 
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
                  <td className="px-6 py-4 whitespace-nowrap">{p.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.date_of_birth}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.country}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {/* Future: Edit/Delete buttons */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(loading || searching) && <div className="text-center py-4">Loading...</div>}

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
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter phone number" required disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date of Birth</label>
              <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} className="w-full border rounded px-3 py-2" required disabled={loading} />
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
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Address</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter address" required disabled={loading} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Emergency Contact</label>
              <input type="text" name="emergency_contact" value={form.emergency_contact} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter emergency contact" required disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Insurance Provider</label>
              <input type="text" name="insurance_provider" value={form.insurance_provider} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter insurance provider" disabled={loading} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Insurance ID</label>
              <input type="text" name="insurance_id" value={form.insurance_id} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter insurance ID" disabled={loading} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Country</label>
              <input type="text" name="country" value={form.country} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter country" required disabled={loading} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full border rounded px-3 py-2" placeholder="Enter password" required disabled={loading} />
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
    </div>
  );
};

export default PatientsRecord; 