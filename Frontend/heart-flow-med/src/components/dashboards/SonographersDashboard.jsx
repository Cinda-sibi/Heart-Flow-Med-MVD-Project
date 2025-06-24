import React, { useEffect, useState } from 'react';
import { fetchLatestSonographyReferrals } from '../../apis/SonographersDashboardApis';
import { Users, ClipboardList, CheckCircle, FileText } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color = 'blue' }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className={`p-3 rounded-lg bg-${color}-100`}>
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const SonographersDashboard = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    reports: 0,
  });

  // Modal state
  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportError, setReportError] = useState(null);
  const backendUrl = 'http://localhost:8000'; // or from env

  useEffect(() => {
    const fetchReferrals = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchLatestSonographyReferrals();
        const data = response.data || response;
        setReferrals(data);
        // Calculate stats
        const total = data.length;
        const completed = data.filter(r => r.status === 'Completed').length;
        const pending = data.filter(r => r.status !== 'Completed').length;
        const reports = data.filter(r => r.report).length;
        setStats({ total, completed, pending, reports });
      } catch (err) {
        setError(err.message || 'Failed to fetch referrals');
      } finally {
        setLoading(false);
      }
    };
    fetchReferrals();
  }, []);

  // Modal logic
  const handleViewReport = (reportUrl) => {
    setSelectedReport(reportUrl);
    setReportError(null);
    setIsModalOpen(true);
  };

  const ReportModal = () => {
    if (!isModalOpen) return null;
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
              setReportError(null);
            }}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="mt-4">
            {reportError ? (
              <div className="text-red-500 text-center">{reportError}</div>
            ) : isImage ? (
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
                src={selectedReport ? `${backendUrl}${selectedReport}` : ''}
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
                  href={selectedReport ? `${backendUrl}${selectedReport}` : ''}
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
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sonographer Dashboard</h1>
        <p className="text-gray-600 mb-6">Overview of your sonography referrals and reports.</p>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard title="Total Referrals" value={stats.total} icon={ClipboardList} color="blue" />
        <StatCard title="Completed Referrals" value={stats.completed} icon={CheckCircle} color="green" />
        <StatCard title="Pending Referrals" value={stats.pending} icon={Users} color="yellow" />
        <StatCard title="Reports Uploaded" value={stats.reports} icon={FileText} color="purple" />
      </div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Recent Referrals</h2>
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
                        onClick={() => handleViewReport(ref.report)}
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        View Report
                      </button>
                    ) : (
                      <span className="text-gray-400">No Report</span>
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
