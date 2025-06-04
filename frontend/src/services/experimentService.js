import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Save experiment results
export const saveExperimentResults = async (studentId, experimentId, input, output) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/experiments/results`, {
      studentId,
      experimentId,
      input,
      output
    });
    return response.data;
  } catch (error) {
    console.error('Error saving experiment results:', error);
    throw error;
  }
};

// Get experiment results
export const getExperimentResults = async (studentId, experimentId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/experiments/results/${studentId}/${experimentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching experiment results:', error);
    throw error;
  }
};

// Save experiment notes
export const saveExperimentNotes = async (studentId, experimentId, notes, noteId = null) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/experiments/notes`, {
      studentId,
      experimentId,
      notes,
      noteId
    });
    return response.data;
  } catch (error) {
    console.error('Error saving experiment notes:', error);
    throw error;
  }
};

// Get experiment notes
export const getExperimentNotes = async (studentId, experimentId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/experiments/notes/${studentId}/${experimentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching experiment notes:', error);
    throw error;
  }
};
