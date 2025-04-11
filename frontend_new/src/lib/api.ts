import { toast } from "sonner";

const API_URL = "http://localhost:5000/api";

// Helper function to handle responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Show error toast
    toast.error(data.message || "Something went wrong");
    throw new Error(data.message || "Something went wrong");
  }
  
  return data;
};

// Authentication
export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  
  return handleResponse(response);
};

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
  
  return handleResponse(response);
};

export const getUserProfile = async (token) => {
  const response = await fetch(`${API_URL}/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  return handleResponse(response);
};

// Labs
export const createLab = async (labData, token) => {
  const response = await fetch(`${API_URL}/labs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(labData),
  });
  
  return handleResponse(response);
};

export const getMyLabs = async (token) => {
  const response = await fetch(`${API_URL}/labs/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  return handleResponse(response);
};

export const getLabById = async (labId, token) => {
  const response = await fetch(`${API_URL}/labs/${labId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  return handleResponse(response);
};

// Projects
export const createProject = async (projectData, token) => {
  const response = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(projectData),
  });
  
  return handleResponse(response);
};

export const getLabProjects = async (labId, token) => {
  const response = await fetch(`${API_URL}/projects/lab/${labId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  return handleResponse(response);
};

export const getProjectById = async (projectId, token) => {
  const response = await fetch(`${API_URL}/projects/${projectId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  return handleResponse(response);
};

export const updateProjectFile = async (projectId, fileData, token) => {
  const response = await fetch(`${API_URL}/projects/${projectId}/files`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(fileData),
  });
  
  return handleResponse(response);
};
