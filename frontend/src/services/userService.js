import axios from 'axios';

const API_BASE_URL =  'http://localhost:3000/api';

// Get all users (admin only)
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/getUsers`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId, userData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Register a new user
export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Admin functions
export const getStudentsList = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/students`);
    return response.data;
  } catch (error) {
    console.error('Error fetching students list:', error);
    throw error;
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/admin/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Get user details by ID
export const getUserDetails = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}/details`);
    return response.data.user;
  } catch (error) {
    console.error('Error fetching user details:', error);
    // Return a default user object to prevent UI errors
    return { firstName: 'User', username: 'User' };
  }
};

export default {
  getAllUsers,
  getUserProfile,
  updateUserProfile,
  registerUser,
  loginUser,
  getStudentsList,
  updateUserRole,
  deleteUser,
  getUserDetails
};
