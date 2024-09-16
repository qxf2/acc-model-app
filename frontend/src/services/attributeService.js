import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    console.error("User is not authenticated");
    return {};
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const fetchAttributes = async () => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/attributes`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching attributes:", error);
    throw error;
  }
};

export const createAttribute = async (data) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/attributes`,
      data,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error creating attribute:", error);
    throw error;
  }
};

export const updateAttribute = async (id, data) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/attributes/${id}`,
      data,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error updating attribute:", error);
    throw error;
  }
};

export const deleteAttribute = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/attributes/${id}`, getAuthHeaders());
  } catch (error) {
    console.error("Error deleting attribute:", error);
    throw error;
  }
};
