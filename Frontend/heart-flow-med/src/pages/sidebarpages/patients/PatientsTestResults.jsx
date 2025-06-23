import React, { useState } from 'react';
import { Eye, Download, X } from 'lucide-react';

const mockTestResults = [
  {
    id: 1,
    testName: 'Echocardiogram',
    date: '2024-05-01',
    result: 'Normal',
    status: 'Completed',
    reportUrl: '/sample-reports/echo-report.pdf',
  },
  {
    id: 2,
    testName: 'Blood Test',
    date: '2024-05-10',
    result: 'High Cholesterol',
    status: 'Completed',
    reportUrl: '/sample-reports/blood-report.pdf',
  },
  {
    id: 3,
    testName: 'CT Scan',
    date: '2024-05-15',
    result: 'Pending',
    status: 'In Progress',
    reportUrl: null,
  },
];

const statusColor = {
  Completed: 'text-green-600',
  'In Progress': 'text-yellow-600',
  Pending: 'text-gray-500',
};

const PatientsTestResults = () => {
  const [viewReport, setViewReport] = useState(null);

  const handleView = (reportUrl) => {
    setViewReport(reportUrl);
  };

  const handleCloseModal = () => {
    setViewReport(null);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">My Test Results</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockTestResults.map((test) => (
              <tr key={test.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{test.testName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{test.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{test.result}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${statusColor[test.status] || ''}`}>{test.status}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm flex gap-2">
                  {test.reportUrl && (
                    <>
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        title="View Report"
                        onClick={() => handleView(test.reportUrl)}
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <a
                        href={test.reportUrl}
                        download
                        className="text-green-600 hover:text-green-900"
                        title="Download Report"
                      >
                        <Download className="h-5 w-5" />
                      </a>
                    </>
                  )}
                  {!test.reportUrl && <span className="text-gray-400 italic">No report</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for viewing report */}
      {viewReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
              onClick={handleCloseModal}
              title="Close"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Test Report</h3>
              {/* For demo, use iframe for PDF. Replace with PDF viewer if needed. */}
              <iframe
                src={viewReport}
                title="Test Report"
                className="w-full h-96 border rounded"
              >
                This browser does not support PDFs. <a href={viewReport}>Download PDF</a>
              </iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsTestResults;
