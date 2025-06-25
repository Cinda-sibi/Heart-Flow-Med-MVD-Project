import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Mic } from 'lucide-react';
import { referPatientReferral, getRecentPatientReferrals } from '../../apis/GeneralPractinionerDashboardApis';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Active: 'bg-green-100 text-green-800',
  Accepted: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

const GeneralPractitioner = () => {
  // State for assigned patients, appointments, results, and form
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Referral form state
  const [form, setForm] = useState({
    patient_first_name: '',
    patient_last_name: '',
    patient_email: '',
    patient_phone: '',
    gender: '',
    age: '',
    reason: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const [recordingField, setRecordingField] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = React.useRef(null);

  // Fetch assigned patients from API
  useEffect(() => {
    setLoading(true);
    setError(null);
    getRecentPatientReferrals()
      .then((response) => {
        if (response.data && response.data.status) {
          const data = response.data.data || [];
          setAssignedPatients(
            data.map((ref) => ({
              id: ref.id,
              name: `${ref.patient_first_name} ${ref.patient_last_name}`,
              age: ref.age,
              status: ref.status || 'Pending',
            }))
          );
        } else {
          setError('Failed to fetch assigned patients.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch assigned patients.');
        setLoading(false);
      });
  }, []);

  // Handle form input change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Voice recording handler
  const startRecording = (field) => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    setRecordingField(field);
    setIsRecording(true);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setForm((prev) => ({ ...prev, [field]: transcript }));
      setIsRecording(false);
      setRecordingField(null);
    };
    recognition.onerror = () => {
      setIsRecording(false);
      setRecordingField(null);
    };
    recognition.onend = () => {
      setIsRecording(false);
      setRecordingField(null);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setRecordingField(null);
  };

  // Handle referral form submit
  const handleReferralSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);
    try {
      for (const key of Object.keys(form)) {
        if (!form[key]) {
          setFormError('Please fill all fields.');
          setFormLoading(false);
          return;
        }
      }
      await referPatientReferral({
        ...form,
        age: Number(form.age),
      });
      setFormSuccess('Patient referral submitted successfully!');
      setForm({
        patient_first_name: '',
        patient_last_name: '',
        patient_email: '',
        patient_phone: '',
        gender: '',
        age: '',
        reason: '',
      });
    } catch (err) {
      setFormError('Failed to submit referral.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <main className="flex-1 p-4 md:p-8 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-700 flex items-center gap-2">
              <Users className="h-8 w-8 text-gray-600" /> General Practitioner Dashboard
            </h1>
            <p className="text-gray-600 text-lg mt-1">Assign patients to clinics and view appointment results.</p>
          </div>
        </div>

        {/* Assigned Patients Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Recent Assigned Patients</h2>
          </div>
          {loading ? (
            <div className="text-blue-600 text-lg">Loading...</div>
          ) : error ? (
            <div className="text-red-600 text-lg">{error}</div>
          ) : assignedPatients.length === 0 ? (
            <div className="text-gray-700 text-lg">No assigned patients found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {assignedPatients.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col gap-2 hover:shadow-xl transition">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="font-semibold text-lg text-gray-900">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-gray-700">
                    <span className="text-sm">Age: <span className="font-medium">{p.age}</span></span>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColors[p.status] || 'bg-gray-100 text-gray-700'}`}>{p.status}</span>
                  </div>
                  <button
                    className="mt-4 px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition self-start"
                    onClick={() => alert('View details for ' + p.name)}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Divider */}
        <div className="border-t border-gray-200 my-8" />

        {/* Patient Referral Form Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Patient Referral Form</h2>
          </div>
          <form className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleReferralSubmit}>
            <input
              type="text"
              name="patient_first_name"
              className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="First Name"
              value={form.patient_first_name}
              onChange={handleFormChange}
            />
            <button
              type="button"
              className={`ml-2 p-2 rounded-full ${recordingField === 'patient_first_name' && isRecording ? 'bg-red-100' : 'bg-gray-100'} hover:bg-blue-100`}
              onClick={() => (isRecording ? stopRecording() : startRecording('patient_first_name'))}
              aria-label="Record First Name"
            >
              <Mic className={`h-5 w-5 ${recordingField === 'patient_first_name' && isRecording ? 'text-red-500 animate-pulse' : 'text-blue-600'}`} />
            </button>
            <input
              type="text"
              name="patient_last_name"
              className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Last Name"
              value={form.patient_last_name}
              onChange={handleFormChange}
            />
            <button
              type="button"
              className={`ml-2 p-2 rounded-full ${recordingField === 'patient_last_name' && isRecording ? 'bg-red-100' : 'bg-gray-100'} hover:bg-blue-100`}
              onClick={() => (isRecording ? stopRecording() : startRecording('patient_last_name'))}
              aria-label="Record Last Name"
            >
              <Mic className={`h-5 w-5 ${recordingField === 'patient_last_name' && isRecording ? 'text-red-500 animate-pulse' : 'text-blue-600'}`} />
            </button>
            <input
              type="email"
              name="patient_email"
              className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Email"
              value={form.patient_email}
              onChange={handleFormChange}
            />
            <button
              type="button"
              className={`ml-2 p-2 rounded-full ${recordingField === 'patient_email' && isRecording ? 'bg-red-100' : 'bg-gray-100'} hover:bg-blue-100`}
              onClick={() => (isRecording ? stopRecording() : startRecording('patient_email'))}
              aria-label="Record Email"
            >
              <Mic className={`h-5 w-5 ${recordingField === 'patient_email' && isRecording ? 'text-red-500 animate-pulse' : 'text-blue-600'}`} />
            </button>
            <input
              type="text"
              name="patient_phone"
              className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Phone"
              value={form.patient_phone}
              onChange={handleFormChange}
            />
            <button
              type="button"
              className={`ml-2 p-2 rounded-full ${recordingField === 'patient_phone' && isRecording ? 'bg-red-100' : 'bg-gray-100'} hover:bg-blue-100`}
              onClick={() => (isRecording ? stopRecording() : startRecording('patient_phone'))}
              aria-label="Record Phone"
            >
              <Mic className={`h-5 w-5 ${recordingField === 'patient_phone' && isRecording ? 'text-red-500 animate-pulse' : 'text-blue-600'}`} />
            </button>
            <select
              name="gender"
              className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              value={form.gender}
              onChange={handleFormChange}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input
              type="number"
              name="age"
              className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Age"
              value={form.age}
              onChange={handleFormChange}
              min="0"
            />
            <button
              type="button"
              className={`ml-2 p-2 rounded-full ${recordingField === 'age' && isRecording ? 'bg-red-100' : 'bg-gray-100'} hover:bg-blue-100`}
              onClick={() => (isRecording ? stopRecording() : startRecording('age'))}
              aria-label="Record Age"
            >
              <Mic className={`h-5 w-5 ${recordingField === 'age' && isRecording ? 'text-red-500 animate-pulse' : 'text-blue-600'}`} />
            </button>
            <textarea
              name="reason"
              className="border rounded-lg px-4 py-3 md:col-span-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Reason for referral"
              value={form.reason}
              onChange={handleFormChange}
              rows={3}
            />
            <button
              type="button"
              className={`ml-2 p-2 rounded-full ${recordingField === 'reason' && isRecording ? 'bg-red-100' : 'bg-gray-100'} hover:bg-blue-100`}
              onClick={() => (isRecording ? stopRecording() : startRecording('reason'))}
              aria-label="Record Reason"
            >
              <Mic className={`h-5 w-5 ${recordingField === 'reason' && isRecording ? 'text-red-500 animate-pulse' : 'text-blue-600'}`} />
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 md:col-span-2 font-semibold text-lg shadow"
              disabled={formLoading}
            >
              {formLoading ? 'Submitting...' : 'Submit Referral'}
            </button>
            {formError && <div className="mt-2 text-red-600 md:col-span-2">{formError}</div>}
            {formSuccess && <div className="mt-2 text-green-600 md:col-span-2">{formSuccess}</div>}
          </form>
        </section>
      </div>
    </main>
  );
};

export default GeneralPractitioner;
