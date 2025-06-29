import React, { useEffect, useState } from 'react';
import { getAssignedPatients, uploadTestResult } from '../../../apis/NurseDashboardApis';
import Modal from '../../../components/layout/Modal';
import { FileText, Download } from 'lucide-react';

const PatientsData = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({});
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [file, setFile] = useState(null);
  const [resultSummary, setResultSummary] = useState('');
  const [formError, setFormError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAssignedPatients();
      setPatients(data);
    } catch (err) {
      setError('Failed to fetch patients.');
    }
    setLoading(false);
  };

  const openUploadModal = (patient) => {
    setSelectedPatient(patient);
    setFile(null);
    setResultSummary('');
    setFormError('');
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedPatient(null);
    setFile(null);
    setResultSummary('');
    setFormError('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setFormError('Please select a file.');
      return;
    }
    if (!resultSummary.trim()) {
      setFormError('Result summary is required.');
      return;
    }
    setUploadingId(selectedPatient.id);
    setUploadStatus((prev) => ({ ...prev, [selectedPatient.id]: 'Uploading...' }));
    setFormError('');
    try {
      await uploadTestResult(selectedPatient.id, resultSummary, file);
      setUploadStatus((prev) => ({ ...prev, [selectedPatient.id]: 'Uploaded!' }));
      handleModalClose();
    } catch (err) {
      let msg = 'Error uploading';
      if (err.response && err.response.data && err.response.data.message && err.response.data.message.result_summary) {
        msg = err.response.data.message.result_summary[0];
        setFormError(msg);
      } else {
        setFormError(msg);
      }
      setUploadStatus((prev) => ({ ...prev, [selectedPatient.id]: 'Error uploading' }));
    }
    setUploadingId(null);
  };

  const handlePreview = (url) => {
    setPreviewUrl(url);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewUrl(null);
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-2xl font-bold mb-4 text-black">Patients Data</h1>
      {loading ? (
        <div className="text-center text-gray-500 py-8">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : patients.length === 0 ? (
        <div className="text-center text-gray-500 py-8 font-semibold">No data found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-blue-50">
                <th className="py-3 px-4 text-left font-semibold text-blue-900">Name</th>
                <th className="py-3 px-4 text-left font-semibold text-blue-900">Test</th>
                <th className="py-3 px-4 text-left font-semibold text-blue-900">Date</th>
                <th className="py-3 px-4 text-left font-semibold text-blue-900">Time</th>
                <th className="py-3 px-4 text-left font-semibold text-blue-900">Status</th>
                <th className="py-3 px-4 text-left font-semibold text-blue-900">Upload Test Result</th>
                <th className="py-3 px-4 text-left font-semibold text-blue-900">Report</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-b hover:bg-blue-50 transition-colors">
                  <td className="py-3 px-4">{patient.patient_name}</td>
                  <td className="py-3 px-4">{patient.test_name}</td>
                  <td className="py-3 px-4">{patient.date}</td>
                  <td className="py-3 px-4">{patient.time}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {patient.status?.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      className="inline-block cursor-pointer bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-xs font-semibold shadow"
                      onClick={() => openUploadModal(patient)}
                      disabled={uploadingId === patient.id}
                    >
                      {uploadingId === patient.id ? 'Uploading...' : 'Upload'}
                    </button>
                    {uploadStatus[patient.id] && (
                      <span className="ml-2 text-xs font-medium text-gray-600">{uploadStatus[patient.id]}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {patient.attached_report_url ? (
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handlePreview(patient.attached_report_url)}
                          className="flex items-center px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-semibold shadow"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          View
                        </button>
                        <a
                          href={patient.attached_report_url}
                          download
                          className="flex items-center px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs font-semibold shadow"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No report</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal isOpen={modalOpen} onClose={handleModalClose}>
        <form onSubmit={handleUpload} className="space-y-4">
          <h2 className="text-lg font-bold text-blue-700">Upload Test Result</h2>
          <div>
            <label className="block font-medium text-gray-700 mb-1">File</label>
            <input
              type="file"
              className="block w-full border border-gray-300 rounded px-3 py-2"
              onChange={e => setFile(e.target.files[0])}
              disabled={uploadingId === (selectedPatient && selectedPatient.id)}
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-1">Result Summary</label>
            <textarea
              className="block w-full border border-gray-300 rounded px-3 py-2"
              rows={3}
              value={resultSummary}
              onChange={e => setResultSummary(e.target.value)}
              disabled={uploadingId === (selectedPatient && selectedPatient.id)}
            />
          </div>
          {formError && <div className="text-red-600 text-sm font-medium">{formError}</div>}
          <div className="flex justify-end">
            <button
              type="button"
              className="mr-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
              onClick={handleModalClose}
              disabled={uploadingId === (selectedPatient && selectedPatient.id)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              disabled={uploadingId === (selectedPatient && selectedPatient.id)}
            >
              {uploadingId === (selectedPatient && selectedPatient.id) ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={previewOpen} onClose={handleClosePreview}>
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-blue-700">Report Preview</h2>
          {previewUrl && previewUrl.match(/\.pdf$/i) ? (
            <iframe
              src={previewUrl}
              title="PDF Preview"
              className="w-full h-[70vh] border rounded"
            />
          ) : previewUrl && previewUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
            <img
              src={previewUrl}
              alt="Report Preview"
              className="max-w-full max-h-[70vh] mx-auto border rounded"
            />
          ) : previewUrl ? (
            <a
              href={previewUrl}
              download
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
            >
              <Download className="w-4 h-4 mr-2" />
              Download File
            </a>
          ) : null}
        </div>
      </Modal>
    </div>
  );
};

export default PatientsData;
