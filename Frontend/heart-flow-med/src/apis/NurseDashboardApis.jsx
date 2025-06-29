import axiosInstance from '../config/axiosInstance';


export const getTodaysAssignedPatients = async () => {
    try {
      const response = await axiosInstance.get('/appointments-today/');
      // Assuming the backend returns { success: true, message: '', data: [...] }
      return response.data.data;
    } catch (error) {
      console.error('Error fetching assigned patients:', error);
      throw error;
    }
  };



export const getAssignedPatients = async () => {
  try {
    const response = await axiosInstance.get('/assigned-patients-list/');
    // Assuming the backend returns { success: true, message: '', data: [...] }
    return response.data.data;
  } catch (error) {
    console.error('Error fetching assigned patients:', error);
    throw error;
  }
};

export const getDiagnosticTasksSummary = async () => {
  try {
    const response = await axiosInstance.get('/diagnostic-tasks-summary-count/');
    // Assuming the backend returns the summary object directly
    return response.data;
  } catch (error) {
    console.error('Error fetching diagnostic tasks summary:', error);
    throw error;
  }
};

export const uploadTestResult = async (appointmentId, resultSummary, file) => {
  const formData = new FormData();
  formData.append('result_summary', resultSummary);
  formData.append('attached_report', file);
  try {
    const response = await axiosInstance.post(`/diagnostic-results-upload/${appointmentId}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading test result:', error);
    throw error;
  }
};
