import React, { useEffect, useState } from 'react';
import { fetchAllSonographers, assignPatientToSonographer, fetchSonographyReferrals, fetchPatientsByLoginDoctor, fetchSonographyReport } from '../../../apis/DoctorDashboardApis';
import { CheckCircle, User, X } from 'lucide-react';
import Modal from '../../../components/layout/Modal';

const getInitials = (first, last) => {
  if (!first && !last) return '?';
  return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
};

const AssiginingToSonographers = () => {
  const [sonographers, setSonographers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [assigningPatientId, setAssigningPatientId] = useState(null); // patient id being assigned
  const [selectedSonographer, setSelectedSonographer] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [referrals, setReferrals] = useState([]);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');
  const [reportData, setReportData] = useState(null);
  const [selectedReferralId, setSelectedReferralId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const sonographerRes = await fetchAllSonographers();
        setSonographers(sonographerRes.data || []);
        const patientRes = await fetchPatientsByLoginDoctor();
        setPatients(
          (patientRes.data || []).map(p => ({
            ...p.user,
            ...p, // keep top-level fields like id, unique_id, etc.
            user_id: p.user?.id,
            email: p.user?.email,
            first_name: p.user?.first_name,
            last_name: p.user?.last_name,
          }))
        );
        // Fetch referrals
        const referralRes = await fetchSonographyReferrals();
        setReferrals(Array.isArray(referralRes.data) ? referralRes.data : []);
      } catch (err) {
        setError('Failed to fetch sonographers or patients');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAssignClick = (patientId) => {
    setAssigningPatientId(patientId);
    setSelectedSonographer(null);
    setReason('');
    setFieldErrors({});
    setError('');
    setSuccess('');
  };

  const handleCancelAssign = () => {
    setAssigningPatientId(null);
    setSelectedSonographer(null);
    setReason('');
    setFieldErrors({});
    setError('');
    setSuccess('');
  };

  const handleConfirmAssign = async (patient) => {
    if (!selectedSonographer || !reason) return;
    setLoading(true);
    setError('');
    setSuccess('');
    setFieldErrors({});
    try {
      await assignPatientToSonographer({
        patient: patient.user_id,
        sonographer: selectedSonographer.id,
        reason,
      });
      setSuccess(`Assigned patient ${patient.first_name} to sonographer ${selectedSonographer.first_name}`);
      setAssigningPatientId(null);
      setSelectedSonographer(null);
      setReason('');
      // Optionally, refresh referrals
      const referralRes = await fetchSonographyReferrals();
      setReferrals(Array.isArray(referralRes.data) ? referralRes.data : []);
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

  const handleViewReport = async (referralId) => {
    setReportModalOpen(true);
    setReportLoading(true);
    setReportError('');
    setReportData(null);
    setSelectedReferralId(referralId);
    try {
      const res = await fetchSonographyReport(referralId);
      setReportData(res.data || res);
    } catch (err) {
      setReportError(
        err?.response?.data?.message || 'Failed to fetch report. It may not be uploaded yet.'
      );
    } finally {
      setReportLoading(false);
    }
  };

  const closeReportModal = () => {
    setReportModalOpen(false);
    setReportData(null);
    setReportError('');
    setSelectedReferralId(null);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-3xl font-extrabold mb-6 text-center">Assign Patients to Sonographers</h2>
      {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4 text-center">{success}</div>}
      <div>
        <h3 className="text-xl font-semibold mb-4">Patients</h3>
        <div className="flex flex-col gap-3">
          {patients.length === 0 && <div className="text-gray-500">No patients found.</div>}
          {patients.map((p) => (
            <div
              key={p.id}
              className={`flex flex-col gap-2 p-4 rounded-lg border shadow-sm transition-all duration-150 bg-white`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-200 text-green-800 font-bold text-lg">
                  {getInitials(p.first_name, p.last_name)}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{p.first_name} {p.last_name} - {p.unique_id}</div>
                  <div className="text-gray-600 text-sm">{p.email}</div>
                </div>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition disabled:opacity-50"
                  disabled={loading}
                  onClick={() => handleAssignClick(p.id)}
                >
                  Assign
                </button>
              </div>
              {/* Assignment Modal/Inline for this patient */}
              {assigningPatientId === p.id && (
                <div className="mt-4 border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-lg">Assign to Sonographer</span>
                    <button onClick={handleCancelAssign} className="text-gray-500 hover:text-red-500"><X size={20} /></button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Select Sonographer<span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {sonographers.length === 0 && <div className="text-gray-500 col-span-2">No sonographers found.</div>}
                      {sonographers.map((s) => (
                        <div
                          key={s.id}
                          className={`flex items-center gap-3 p-2 rounded border cursor-pointer transition ${selectedSonographer?.id === s.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-blue-50'}`}
                          onClick={() => setSelectedSonographer(s)}
                        >
                          <div className="w-8 h-8 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center font-bold text-base">{getInitials(s.first_name, s.last_name)}</div>
                          <div className="flex-1">
                            <div className="font-semibold">{s.first_name} {s.last_name}</div>
                            <div className="text-gray-600 text-xs">{s.email}</div>
                          </div>
                          {selectedSonographer?.id === s.id && <CheckCircle className="text-blue-500" size={18} />}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4">
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
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                      disabled={!selectedSonographer || !reason || loading}
                      onClick={() => handleConfirmAssign(p)}
                    >
                      {loading && <span className="loader border-white border-2 border-t-blue-500 mr-2 animate-spin rounded-full w-5 h-5"></span>}
                      Confirm Assignment
                    </button>
                    <button
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold shadow hover:bg-gray-300 transition"
                      onClick={handleCancelAssign}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                  {fieldErrors.patient && (
                    <div className="text-red-500 text-sm mt-2 text-center">{Array.isArray(fieldErrors.patient) ? fieldErrors.patient.join(', ') : fieldErrors.patient}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Sonography Referrals List */}
      <div className="mt-12">
        <h3 className="text-2xl font-bold mb-4 text-center">Sonography Referrals</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sonographer</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Report</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {referrals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">No referrals found.</td>
                </tr>
              ) : (
                referrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-blue-50 transition">
                    <td className="px-4 py-2">{ref.patient_name || (ref.patient && `${ref.patient.first_name} ${ref.patient.last_name}`)}</td>
                    <td className="px-4 py-2">{ref.sonographer_name || (ref.sonographer && `${ref.sonographer.first_name} ${ref.sonographer.last_name}`)}</td>
                    <td className="px-4 py-2">{ref.reason}</td>
                    <td className="px-4 py-2">{ref.status || '-'}</td>
                    <td className="px-4 py-2">
                      {ref.report_url || ref.report ? (
                        <button
                          className="text-blue-600 underline hover:text-blue-800 font-semibold"
                          onClick={() => handleViewReport(ref.id)}
                          type="button"
                        >
                          View Report
                        </button>
                      ) : (
                        <span className="text-gray-400 italic">Not uploaded</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Sonography Report Modal */}
      <Modal isOpen={reportModalOpen} onClose={closeReportModal}>
        <div className="min-h-[120px]">
          <h2 className="text-xl font-bold mb-4">Sonography Report</h2>
          {reportLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : reportError ? (
            <div className="text-red-500 text-center py-4">{reportError}</div>
          ) : reportData && reportData.report ? (
            <div className="flex flex-col items-center gap-4">
              {/* If PDF, show embed; if image, show img; else, show download link */}
              {(() => {
                const url = reportData.report;
                if (url.match(/\.(pdf)$/i)) {
                  return (
                    <embed src={url} type="application/pdf" width="100%" height="500px" className="rounded border" />
                  );
                } else if (url.match(/\.(jpg|jpeg|png|gif)$/i)) {
                  return (
                    <img src={url} alt="Sonography Report" className="max-h-[400px] rounded border" />
                  );
                } else {
                  return (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Download Report</a>
                  );
                }
              })()}
              {reportData.notes && (
                <div className="mt-2 text-gray-700"><span className="font-semibold">Notes:</span> {reportData.notes}</div>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-4">No report data available.</div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AssiginingToSonographers;

// Add this to your global CSS or Tailwind config for the loader if not present:
// .loader { border-radius: 9999px; border-width: 2px; border-style: solid; border-top-color: #3b82f6; border-right-color: transparent; border-bottom-color: transparent; border-left-color: transparent; }
