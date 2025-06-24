import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../config/axiosInstance';
import { referPatientReferral, getAdministrativeStaffList, getPatientReferrals } from '../../../apis/GeneralPractinionerDashboardApis';
import { FaUserPlus, FaUserFriends, FaInfoCircle } from 'react-icons/fa';

const initialForm = {
  referred_to: '',
  patient_first_name: '',
  patient_last_name: '',
  patient_email: '',
  patient_phone: '',
  gender: '',
  age: '',
  reason: '',
};

const genderOptions = [
  { value: '', label: 'Select Gender' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

const PatientsReferral = () => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [adminStaffs, setAdminStaffs] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [referralsLoading, setReferralsLoading] = useState(false);
  const [referralsError, setReferralsError] = useState('');

  useEffect(() => {
    const fetchAdminStaffs = async () => {
      try {
        const res = await getAdministrativeStaffList();
        let staffList = [];
        if (Array.isArray(res.data?.data)) {
          staffList = res.data.data;
        }
        setAdminStaffs(staffList);
      } catch (err) {
        console.error('Error fetching admin staffs:', err);
        setAdminStaffs([]);
      }
    };
    fetchAdminStaffs();
  }, []);

  const fetchReferrals = async () => {
    setReferralsLoading(true);
    setReferralsError('');
    try {
      const res = await getPatientReferrals();
      let list = [];
      if (Array.isArray(res.data?.data)) {
        list = res.data.data;
      } else if (Array.isArray(res.data)) {
        list = res.data;
      }
      setReferrals(list);
    } catch (err) {
      setReferralsError('Failed to load referrals.');
      setReferrals([]);
    } finally {
      setReferralsLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    
    try {
      // Prepare payload - only include fields that have values
      const payload = {
        referred_to: parseInt(form.referred_to, 10),
        patient_first_name: form.patient_first_name,
        patient_last_name: form.patient_last_name,
        patient_email: form.patient_email,
        patient_phone: form.patient_phone,
        reason: form.reason,
      };

      // Only include gender and age if they have values
      if (form.gender) {
        payload.gender = form.gender;
      }
      if (form.age) {
        payload.age = parseInt(form.age, 10);
      }

      if (!payload.referred_to) {
        setError('Please select a staff to refer to.');
        setLoading(false);
        return;
      }

      await referPatientReferral(payload);
      setSuccess('Patient referred successfully!');
      setForm(initialForm);
      fetchReferrals(); // Refresh referral list
    } catch (err) {
      let msg = 'Failed to refer patient.';
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          msg = err.response.data;
        } else if (err.response.data.detail) {
          msg = err.response.data.detail;
        } else if (typeof err.response.data === 'object') {
          const firstKey = Object.keys(err.response.data)[0];
          if (firstKey) {
            msg = `${firstKey}: ${err.response.data[firstKey]}`;
          }
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 sm:p-6 md:p-10 space-y-12 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen">
      {/* Page Header */}
      <div className="max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-4xl font-extrabold text-blue-900 flex items-center justify-center gap-3 mb-2">
          <FaUserPlus className="text-blue-500" /> Patient Referral
        </h1>
        <p className="text-lg text-blue-700">Easily refer patients to administrative staff and track your referral history.</p>
      </div>

      {/* Referral Form Card */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-blue-200">
          <div className="bg-gradient-to-r from-blue-400 to-blue-600 px-10 py-8">
            <h2 className="text-3xl font-bold text-white text-center tracking-tight flex items-center justify-center gap-2">
              <FaUserFriends className="text-blue-100" /> Patient Referral Form
            </h2>
            <p className="text-blue-100 text-center mt-2 text-lg">
              Refer patients to administrative staff members
            </p>
          </div>
          <div className="px-10 py-8 bg-blue-50">
            {success && (
              <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg flex items-center gap-3">
                <svg className="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-900 font-semibold">{success}</span>
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg flex items-center gap-3">
                <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-900 font-semibold">{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Section: Staff Selection */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FaUserFriends className="text-blue-500" />
                  <h3 className="text-lg font-bold text-blue-700">Referral Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-semibold text-blue-700 mb-2">
                      Referred To <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="referred_to"
                      value={form.referred_to}
                      onChange={handleChange}
                      className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-white"
                      required
                    >
                      <option value="">Select Staff Member</option>
                      {adminStaffs.map((staff) => (
                        <option key={staff.id} value={staff.id}>
                          {staff.first_name} {staff.last_name} ({staff.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              {/* Section: Patient Info */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FaUserPlus className="text-blue-500" />
                  <h3 className="text-lg font-bold text-blue-700">Patient Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="patient_first_name"
                      value={form.patient_first_name}
                      onChange={handleChange}
                      className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-white"
                      placeholder="Enter first name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="patient_last_name"
                      value={form.patient_last_name}
                      onChange={handleChange}
                      className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-white"
                      placeholder="Enter last name"
                      required
                    />
                  </div>
                </div>
              </div>
              {/* Section: Contact Info */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FaInfoCircle className="text-blue-500" />
                  <h3 className="text-lg font-bold text-blue-700">Contact Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="patient_email"
                      value={form.patient_email}
                      onChange={handleChange}
                      className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-white"
                      placeholder="patient@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="patient_phone"
                      value={form.patient_phone}
                      onChange={handleChange}
                      className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-white"
                      placeholder="+1234567890"
                      required
                    />
                  </div>
                </div>
              </div>
              {/* Section: Patient Details */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FaInfoCircle className="text-blue-500" />
                  <h3 className="text-lg font-bold text-blue-700">Patient Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-white"
                    >
                      {genderOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-blue-700 mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={form.age}
                      onChange={handleChange}
                      className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 bg-white"
                      placeholder="Enter age"
                      min="0"
                      max="150"
                    />
                  </div>
                </div>
              </div>
              {/* Section: Reason for Referral */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FaInfoCircle className="text-blue-500" />
                  <h3 className="text-lg font-bold text-blue-700">Reason for Referral</h3>
                </div>
                <textarea
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  className="w-full border border-blue-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 resize-none bg-white"
                  rows={4}
                  placeholder="Please provide detailed reason for referral..."
                  required
                />
              </div>
              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting Referral...
                    </div>
                  ) : (
                    'Submit Patient Referral'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Referral List Card */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-blue-200">
          <div className="px-10 py-8 border-b border-blue-200 bg-gradient-to-r from-blue-100 to-blue-200 sticky top-0 z-10">
            <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
              <FaUserFriends className="text-blue-500" /> My Patient Referrals
            </h2>
            <p className="text-blue-700 text-base mt-1">All patients you have referred are listed below.</p>
          </div>
          <div className="px-4 md:px-10 py-8 bg-blue-50">
            {referralsLoading ? (
              <div className="text-center text-blue-600 text-lg">Loading referrals...</div>
            ) : referralsError ? (
              <div className="text-center text-red-600 text-lg">{referralsError}</div>
            ) : referrals.length === 0 ? (
              <div className="text-center text-blue-700 text-lg">No referrals found.</div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-blue-200">
                <table className="min-w-full divide-y divide-blue-200 text-sm">
                  <thead className="bg-blue-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-blue-800 uppercase tracking-wider">Patient Name</th>
                      <th className="px-6 py-3 text-left font-semibold text-blue-800 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left font-semibold text-blue-800 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left font-semibold text-blue-800 uppercase tracking-wider">Referred To</th>
                      <th className="px-6 py-3 text-left font-semibold text-blue-800 uppercase tracking-wider">Reason</th>
                      <th className="px-6 py-3 text-left font-semibold text-blue-800 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-100">
                    {referrals.map((ref, idx) => (
                      <tr key={ref.id} className={idx % 2 === 0 ? 'bg-white hover:bg-blue-100 transition' : 'bg-blue-50 hover:bg-blue-100 transition'}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{ref.patient_first_name} {ref.patient_last_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{ref.patient_email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{ref.patient_phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{ref.referred_to_name || ref.referred_to}</td>
                        <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate" title={ref.reason}>{ref.reason}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{ref.created_at ? new Date(ref.created_at).toLocaleString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientsReferral;