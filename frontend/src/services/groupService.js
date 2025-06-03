import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Get all groups joined by a user
export const getJoinedGroups = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/groups/joined/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching joined groups:', error);
    throw error;
  }
};

// Get group details
export const getGroupDetails = async (groupId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/groups/${groupId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching group details:', error);
    throw error;
  }
};

// Create a new group
export const createGroup = async (groupData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/groups/create`, groupData);
    return response.data;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

// Update group
export const updateGroup = async (groupId, updateData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/groups/update/${groupId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating group:', error);
    throw error;
  }
};

// Join a group
export const joinGroup = async (groupId, userId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/groups/join`, { groupId, userId });
    return response.data;
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
};

// Leave a group
export const leaveGroup = async (groupId, userId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/groups/leave`, { groupId, userId });
    return response.data;
  } catch (error) {
    console.error('Error leaving group:', error);
    throw error;
  }
};

// Get group messages
export const getGroupMessages = async (groupId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/groups/${groupId}/messages`);
    return response.data;
  } catch (error) {
    console.error('Error fetching group messages:', error);
    throw error;
  }
};

// Send a message to a group
export const sendGroupMessage = async (groupId, messageData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/groups/${groupId}/messages`, messageData);
    return response.data;
  } catch (error) {
    console.error('Error sending group message:', error);
    throw error;
  }
};

// Add admin to group
export const addGroupAdmin = async (groupId, userId, adminId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/groups/${groupId}/add-admin`, { 
      userId, 
      adminId 
    });
    return response.data;
  } catch (error) {
    console.error('Error adding group admin:', error);
    throw error;
  }
};

// Remove member from group
export const removeMember = async (groupId, userId, memberId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/groups/${groupId}/remove-member`, { 
      userId, 
      memberId 
    });
    return response.data;
  } catch (error) {
    console.error('Error removing group member:', error);
    throw error;
  }
};

// Delete group
export const deleteGroup = async (groupId, userId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/groups/${groupId}?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};

// Admin functions
export const getAllGroups = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/groups`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all groups:', error);
    throw error;
  }
};
