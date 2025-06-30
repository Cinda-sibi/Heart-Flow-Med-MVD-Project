import React, { useState, useEffect } from 'react';
import { Eye, Download, X, AlertCircle } from 'lucide-react';
import { fetchPatientTestResults } from '../../../apis/PatientsDashboardApis';

const PatientsTestResults = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewReport, setViewReport] = useState(null);

  useEffect(() => {
    fetchTestResults();
  }, []);

  const fetchTestResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await fetchPatientTestResults();
      setTestResults(Array.isArray(results) ? results : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch test results');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (reportUrl) => {
    setViewReport(reportUrl);
  };

  const handleCloseModal = () => {
    setViewReport(null);
  };

  const handleDownload = async (reportUrl, testName) => {
    try {
      const response = await fetch(reportUrl);
      if (!response.ok) throw new Error('Failed to download file');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${testName}_report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'text-green-600';
      case 'in progress':
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">My Test Results</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading test results...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">My Test Results</h2>
        <div className="flex items-center justify-center py-8 text-red-600">
          <AlertCircle className="h-6 w-6 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">My Test Results</h2>
      
      {testResults.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No test results found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result Summary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {testResults.map((test) => (
                <tr key={test.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {test.test_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {test.appointment_date}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                    {test.result_summary || 'No summary available'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getStatusColor(test.result_summary)}`}>
                    {test.result_summary ? 'Completed' : 'Pending'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                    {test.attached_report ? (
                      <>
                        <button
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View Report"
                          onClick={() => handleView(test.attached_report)}
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          className="text-green-600 hover:text-green-900 transition-colors"
                          title="Download Report"
                          onClick={() => handleDownload(test.attached_report, test.test_name)}
                        >
                          <Download className="h-5 w-5" />
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-400 italic">No report</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for viewing report */}
      {viewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition-colors"
              onClick={handleCloseModal}
              title="Close"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Test Report</h3>
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <iframe
                  src={viewReport}
                  title="Test Report"
                  className="w-full h-96 border rounded"
                >
                  <p>This browser does not support PDFs. 
                    <a href={viewReport} className="text-blue-600 hover:underline ml-1">
                      Download PDF
                    </a>
                  </p>
                </iframe>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => handleDownload(viewReport, 'Test Report')}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4 inline mr-2" />
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsTestResults;
