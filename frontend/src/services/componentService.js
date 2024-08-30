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

export const fetchACCModels = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/acc-models`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ACC models:', error);
    throw error;
  }
};

export const fetchComponents = async (accModelId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/components/acc_model/${accModelId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching components:', error);
    throw error;
  }
};

export const createComponent = async (data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/components`, data, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error creating component:', error);
    throw error;
  }
};

export const updateComponent = async (id, data) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/components/id/${id}`, data, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error updating component:', error);
    throw error;
  }
};

export const deleteComponent = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/components/${id}`, getAuthHeaders());
  } catch (error) {
    console.error('Error deleting component:', error);
    throw error;
  }
};
