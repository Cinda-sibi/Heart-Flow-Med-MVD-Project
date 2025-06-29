import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Mic, FileText, MicOff, Play, Square } from 'lucide-react';
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

  // Tab state
  const [activeTab, setActiveTab] = useState('form');

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

  // Audio recording state
  const [recordingField, setRecordingField] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioRecording, setAudioRecording] = useState({
    isRecording: false,
    audioBlob: null,
    audioUrl: null,
    duration: 0,
    transcription: '',
    summary: '',
  });
  const [audioForm, setAudioForm] = useState({
    patient_first_name: '',
    patient_last_name: '',
    patient_email: '',
    patient_phone: '',
    gender: '',
    age: '',
    reason: '',
  });
  const [audioFormLoading, setAudioFormLoading] = useState(false);
  const [audioFormError, setAudioFormError] = useState('');
  const [audioFormSuccess, setAudioFormSuccess] = useState('');
  
  const recognitionRef = React.useRef(null);
  const mediaRecorderRef = React.useRef(null);
  const audioChunksRef = React.useRef([]);
  const recognitionAudioRef = React.useRef(null);

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

  // Handle audio form input change
  const handleAudioFormChange = (e) => {
    const { name, value } = e.target;
    setAudioForm((prev) => ({ ...prev, [name]: value }));
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

  // Audio recording handlers with transcription
  const startAudioRecording = async () => {
    try {
      // Start audio recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioRecording((prev) => ({
          ...prev,
          isRecording: false,
          audioBlob,
          audioUrl,
          duration: Math.round(audioChunksRef.current.length * 0.1),
        }));
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.start();
      setAudioRecording((prev) => ({ ...prev, isRecording: true, transcription: '' }));
      // Start speech recognition for transcription
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = true;
        recognition.onresult = (event) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript + ' ';
          }
          setAudioRecording((prev) => ({ ...prev, transcription: transcript.trim() }));
        };
        recognition.onerror = () => {};
        recognition.onend = () => {};
        recognitionAudioRef.current = recognition;
        recognition.start();
      }
    } catch (error) {
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  // Helper: send audio to backend for transcription/summary
  const fetchTranscriptionAndSummary = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'patient_referral.wav');
      // You may want to use a dedicated endpoint for just transcription if available
      const response = await referPatientReferral(formData);
      if (response.data) {
        setAudioRecording((prev) => ({
          ...prev,
          transcription: response.data.transcription || '',
          summary: response.data.summary || '',
        }));
      }
    } catch (err) {
      setAudioRecording((prev) => ({ ...prev, transcription: 'Transcription failed', summary: '' }));
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionAudioRef.current) {
      recognitionAudioRef.current.stop();
    }
    setAudioRecording((prev) => ({ ...prev, isRecording: false }));
    // When audio stops, fetch transcription/summary from backend
    setTimeout(() => {
      if (audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        fetchTranscriptionAndSummary(audioBlob);
      }
    }, 500);
  };

  const playAudioRecording = () => {
    if (audioRecording.audioUrl) {
      const audio = new Audio(audioRecording.audioUrl);
      audio.play();
    }
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

  // Handle audio referral form submit
  const handleAudioReferralSubmit = async (e) => {
    e.preventDefault();
    setAudioFormError('');
    setAudioFormSuccess('');
    setAudioFormLoading(true);
    try {
      for (const key of Object.keys(audioForm)) {
        if (!audioForm[key]) {
          setAudioFormError('Please fill all fields.');
          setAudioFormLoading(false);
          return;
        }
      }
      if (!audioRecording.audioBlob) {
        setAudioFormError('Please record an audio message.');
        setAudioFormLoading(false);
        return;
      }
      // Create FormData to include audio file and transcription
      const formData = new FormData();
      formData.append('file', audioRecording.audioBlob, 'patient_referral.wav');
      formData.append('transcription', audioRecording.transcription);
      Object.keys(audioForm).forEach(key => {
        formData.append(key, audioForm[key]);
      });
      formData.append('age', Number(audioForm.age));
      await referPatientReferral(formData);
      setAudioFormSuccess('Patient referral with audio submitted successfully!');
      setAudioForm({
        patient_first_name: '',
        patient_last_name: '',
        patient_email: '',
        patient_phone: '',
        gender: '',
        age: '',
        reason: '',
      });
      setAudioRecording({
        isRecording: false,
        audioBlob: null,
        audioUrl: null,
        duration: 0,
        transcription: '',
        summary: '',
      });
    } catch (err) {
      setAudioFormError('Failed to submit referral.');
    } finally {
      setAudioFormLoading(false);
    }
  };

  return (
    <main className="flex-1 p-4 md:p-8 bg-gradient-to-br from-blue-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
          <div>
            <h1 className="text-3xl md:text-2xl font-extrabold text-gray-700 flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-600" /> General Practitioner Dashboard
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
                <div
                  key={p.id}
                  className="relative bg-white rounded-2xl shadow-lg border border-gray-100 p-6 flex flex-col gap-3 hover:shadow-2xl hover:border-blue-300 transition-transform duration-200 transform hover:-translate-y-1 group overflow-hidden"
                  style={{ minHeight: '180px' }}
                >
                  {/* Colored accent bar */}
                  <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-blue-500 to-blue-300 rounded-l-2xl" />
                  <div className="flex items-center gap-3 mb-2 z-10">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shadow group-hover:bg-blue-200 transition">
                      <Users className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-bold text-lg text-gray-900 block leading-tight">{p.name}</span>
                      <span className="text-sm text-gray-500">Age: <span className="font-semibold text-gray-700">{p.age}</span></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 z-10">
                    {/* Status badge with icon */}
                    <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-semibold shadow-sm ${statusColors[p.status] || 'bg-gray-100 text-gray-700'}`}
                      >
                      {p.status === 'Pending' && <MicOff className="h-3 w-3" />}
                      {p.status === 'Active' && <Play className="h-3 w-3" />}
                      {p.status === 'Accepted' && <Play className="h-3 w-3" />}
                      {p.status === 'Rejected' && <Square className="h-3 w-3" />}
                      {p.status}
                    </span>
                  </div>
                  <div className="flex-1" />
                  <button
                    className="mt-4 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg font-bold shadow-lg hover:from-blue-700 hover:to-blue-500 transition w-fit z-10"
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

        {/* Patient Referral Section with Tabs */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Patient Referral</h2>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition ${
                activeTab === 'form'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="h-4 w-4" />
              Patient Details Form
            </button>
            {/* <button
              onClick={() => setActiveTab('audio')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition ${
                activeTab === 'audio'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Mic className="h-4 w-4" />
              Audio Recording
            </button> */}
          </div>

          {/* Tab Content */}
          {activeTab === 'form' && (
            <form className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleReferralSubmit}>
              <input
                type="text"
                name="patient_first_name"
                className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="First Name"
                value={form.patient_first_name}
                onChange={handleFormChange}
              />
             
            
              <input
                type="text"
                name="patient_last_name"
                className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Last Name"
                value={form.patient_last_name}
                onChange={handleFormChange}
              />
           
              <input
                type="email"
                name="patient_email"
                className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Email"
                value={form.patient_email}
                onChange={handleFormChange}
              />
              
              <input
                type="text"
                name="patient_phone"
                className="border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Phone"
                value={form.patient_phone}
                onChange={handleFormChange}
              />
              
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
              <textarea
                name="symptoms"
                className="border rounded-lg px-4 py-3 md:col-span-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Symptoms"
                value={form.symptoms}
                onChange={handleFormChange}
                rows={3}
              />
             
              <textarea
                name="reason"
                className="border rounded-lg px-4 py-3 md:col-span-2 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                placeholder="Reason for referral"
                value={form.reason}
                onChange={handleFormChange}
                rows={3}
              />
             
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
          )}

          {activeTab === 'audio' && null}
        </section>
      </div>
    </main>
  );
};

export default GeneralPractitioner;
