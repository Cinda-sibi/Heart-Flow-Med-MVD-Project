import React, { useEffect, useState } from 'react';
import { fetchSonographyReferrals } from '../../../apis/DoctorDashboardApis';
import { uploadSonographyReport, getSonographyReport } from '../../../apis/SonographersDashboardApis';

const SonographersDashboard = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({});
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);

  const backendUrl = 'http://localhost:8000'; // or from env

  useEffect(() => {
    const fetchReferrals = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchSonographyReferrals();
        const data = response.data || response;
        setReferrals(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch referrals');
      } finally {
        setLoading(false);
      }
    };
    fetchReferrals();
  }, []);

  const handleFileUpload = async (referralId, file) => {
    try {
      setUploadStatus(prev => ({ ...prev, [referralId]: 'uploading' }));
      await uploadSonographyReport(referralId, file);
      
      const response = await fetchSonographyReferrals();
      const data = response.data || response;
      setReferrals(data);
      
      setUploadStatus(prev => ({ ...prev, [referralId]: 'success' }));
      
      setTimeout(() => {
        setUploadStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[referralId];
          return newStatus;
        });
      }, 3000);
    } catch (err) {
      setUploadStatus(prev => ({ ...prev, [referralId]: 'error' }));
      console.error('Error uploading report:', err);
    }
  };

  const handleViewReport = async (referralId) => {
    setReportLoading(true);
    setReportError(null);
    try {
      const reportData = await getSonographyReport(referralId);
      setSelectedReport(reportData?.data?.report || null);
      setIsModalOpen(true);
    } catch (err) {
      setReportError(err.message || 'Failed to fetch report');
      console.error('Error fetching report:', err);
    } finally {
      setReportLoading(false);
    }
  };

  const ReportModal = () => {
    if (!isModalOpen) return null;

    if (reportLoading) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 relative">
            <div className="text-center">Loading report...</div>
          </div>
        </div>
      );
    }

    if (reportError) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 relative">
            <div className="text-red-500 text-center">{reportError}</div>
            <button
              onClick={() => {
                setIsModalOpen(false);
                setReportError(null);
              }}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      );
    }

    if (!selectedReport) return null;

    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(selectedReport);
    const isPDF = /\.pdf$/i.test(selectedReport);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 relative">
          <button
            onClick={() => {
              setIsModalOpen(false);
              setSelectedReport(null);
            }}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="mt-4">
            {isImage ? (
              <img
                src={selectedReport ? `${backendUrl}${selectedReport}` : ''}
                alt="Report"
                className="max-w-full max-h-[80vh] object-contain mx-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  setReportError('Failed to load image');
                }}
              />
            ) : isPDF ? (
              <iframe
                src={selectedReport}
                title="PDF Report"
                className="w-full h-[80vh]"
                onError={(e) => {
                  e.target.onerror = null;
                  setReportError('Failed to load PDF');
                }}
              />
            ) : (
              <div className="text-center py-4">
                <a
                  href={selectedReport}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Download Report
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">My Sonography Referrals</h2>
      {loading ? (
        <div className="text-gray-500">Loading referrals...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : referrals.length === 0 ? (
        <div className="text-gray-500">No referrals found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">Patient</th>
                <th className="py-2 px-4 border-b">Doctor</th>
                <th className="py-2 px-4 border-b">Reason</th>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Report</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((ref) => (
                <tr key={ref.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">{ref.patient_name}</td>
                  <td className="py-2 px-4 border-b">{ref.doctor_name}</td>
                  <td className="py-2 px-4 border-b max-w-xs truncate" title={ref.reason}>{ref.reason}</td>
                  <td className="py-2 px-4 border-b">{new Date(ref.referral_date).toLocaleString()}</td>
                  <td className="py-2 px-4 border-b">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${ref.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{ref.status}</span>
                  </td>
                  <td className="py-2 px-4 border-b">
                    {ref.report ? (
                      <button
                        onClick={() => handleViewReport(ref.id)}
                        className="text-blue-600 hover:text-blue-800 underline"
                        disabled={reportLoading}
                      >
                        {reportLoading ? 'Loading...' : 'View Report'}
                      </button>
                    ) : (
                      <span className="text-gray-400">No Report</span>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {!ref.report && (
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(ref.id, e.target.files[0])}
                          className="hidden"
                          id={`file-upload-${ref.id}`}
                        />
                        <label
                          htmlFor={`file-upload-${ref.id}`}
                          className={`cursor-pointer inline-block px-4 py-2 text-sm font-medium rounded-md 
                            ${uploadStatus[ref.id] === 'uploading' 
                              ? 'bg-yellow-100 text-yellow-700' 
                              : uploadStatus[ref.id] === 'success'
                              ? 'bg-green-100 text-green-700'
                              : uploadStatus[ref.id] === 'error'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                        >
                          {uploadStatus[ref.id] === 'uploading' 
                            ? 'Uploading...' 
                            : uploadStatus[ref.id] === 'success'
                            ? 'Uploaded!'
                            : uploadStatus[ref.id] === 'error'
                            ? 'Upload Failed'
                            : 'Upload Report'}
                        </label>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ReportModal />
    </div>
  );
};

export default SonographersDashboard;
