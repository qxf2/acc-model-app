import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.error('User is not authenticated');
    return {};
  }
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  };
};

export const fetchUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const createUser = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users`, data, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const updateUser = async (id, data) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/${id}`, data, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/users/${id}`, getAuthHeaders());
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
