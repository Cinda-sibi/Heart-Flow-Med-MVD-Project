import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Calendar } from 'lucide-react';
import { fetchPatientsByLoginDoctor, fetchPatientById, fetchPatientTestResults } from '../../../apis/DoctorDashboardApis';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [testResultsLoading, setTestResultsLoading] = useState(false);
  const [patientDetailsLoading, setPatientDetailsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await fetchPatientsByLoginDoctor();
        setRecords(data.data);
      } catch (err) {
        setError('Failed to fetch patients');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const openPatientModal = async (patient) => {
    setPatientDetailsLoading(true);
    setTestResultsLoading(true);
    try {
      const data = await fetchPatientById(patient.id);
      setSelectedPatient(data.data || data);
      // Fetch test results for the patient
      const resultsData = await fetchPatientTestResults(patient.id);
      setTestResults(resultsData.data || resultsData);
    } catch (err) {
      setSelectedPatient(null);
      setTestResults([]);
      alert('Failed to fetch patient details or test results');
    } finally {
      setPatientDetailsLoading(false);
      setTestResultsLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedPatient(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Patients And Medical Records</h1>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search records..."
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {/* <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            New Record
          </button> */}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-4">Loading...</div>
          ) : error ? (
            <div className="p-4 text-red-500">{error}</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records && records.length > 0 ? (
                  records
                    .filter(record => {
                      const name = record.user
                        ? `${record.user.first_name} ${record.user.last_name}`.toLowerCase()
                        : '';
                      return name.includes(searchQuery.toLowerCase());
                    })
                    .map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {record.user ? `${record.user.first_name} ${record.user.last_name}` : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          onClick={() => openPatientModal(record)}
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Download className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="px-6 py-4 text-center text-gray-500">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-0 relative overflow-hidden">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 z-10"
              onClick={closeModal}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex flex-col md:flex-row h-full">
              {/* Patient Details Section */}
              <div className="md:w-1/2 p-10 space-y-6 border-b md:border-b-0 md:border-r border-gray-200 bg-blue-50 min-h-[400px] flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-blue-800 mb-4">Patient Details</h2>
                {patientDetailsLoading ? (
                  <div className="text-center text-gray-500">Loading...</div>
                ) : selectedPatient && selectedPatient.user ? (
                  <div className="space-y-3 text-base">
                    <div><span className="font-semibold">Name:</span> {selectedPatient.user.first_name} {selectedPatient.user.last_name}</div>
                    <div><span className="font-semibold">Email:</span> {selectedPatient.user.email}</div>
                    <div><span className="font-semibold">Phone:</span> {selectedPatient.user.phone}</div>
                    <div><span className="font-semibold">Gender:</span> {selectedPatient.gender}</div>
                    <div><span className="font-semibold">DOB:</span> {selectedPatient.date_of_birth}</div>
                    <div><span className="font-semibold">Address:</span> {selectedPatient.address}</div>
                    <div><span className="font-semibold">Insurance:</span> {selectedPatient.insurance_provider}</div>
                    <div><span className="font-semibold">Insurance ID:</span> {selectedPatient.insurance_id}</div>
                    <div><span className="font-semibold">Medical Ref No:</span> {selectedPatient.medical_reference_no || '-'}</div>
                    <div><span className="font-semibold">Unique ID:</span> {selectedPatient.unique_id}</div>
                  </div>
                ) : null}
                <button className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full text-lg font-semibold shadow">
                  Download Full Details
                </button>
              </div>
              {/* Vertical Divider for desktop */}
              <div className="hidden md:block w-px bg-gray-300 mx-0"></div>
              {/* Test Results Section */}
              <div className="md:w-1/2 p-10 flex flex-col bg-white min-h-[400px] justify-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Test Results & Reports</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {testResultsLoading ? (
                    <div className="text-gray-400 italic">Loading test results...</div>
                  ) : testResults.length === 0 ? (
                    <div className="text-gray-400 italic">No test results found.</div>
                  ) : (
                    testResults.map((result, idx) => (
                      <div key={result.id} className="bg-gray-50 rounded p-4 mb-2 shadow flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-gray-900">{result.test_name}</div>
                            <div className="text-xs text-gray-500">{result.date} {result.time}</div>
                          </div>
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">{result.status}</span>
                        </div>
                        <div className="text-sm text-gray-700 mt-1"><span className="font-semibold">Notes:</span> {result.notes || '-'}</div>
                        {result.result_summary ? (
                          <div className="text-sm text-gray-700"><span className="font-semibold">Summary:</span> {result.result_summary}</div>
                        ) : null}
                        <div className="flex gap-3 mt-2">
                          {result.attached_report_url ? (
                            <>
                              <a
                                href={result.attached_report_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                              >
                                View Report
                              </a>
                              <a
                                href={result.attached_report_url}
                                download
                                className="text-green-600 hover:underline text-sm"
                              >
                                Download
                              </a>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No report attached</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords; 