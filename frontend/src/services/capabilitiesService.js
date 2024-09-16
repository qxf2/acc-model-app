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

export const fetchACCModels = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/acc-models`);
    return response.data;
  } catch (error) {
    console.error("Error fetching ACC models:", error);
    throw error;
  }
};

export const fetchComponents = async (accModelId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/components/acc_model/${accModelId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching components:", error);
    throw error;
  }
};

export const fetchCapabilities = async (componentId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/capabilities/component/${componentId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching capabilities:", error);
    throw error;
  }
};

export const createCapability = async (data) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/capabilities`,
      data,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error creating capability:", error);
    throw error;
  }
};

export const updateCapability = async (id, data) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/capabilities/${id}`,
      data,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error updating capability:", error);
    throw error;
  }
};

export const deleteCapability = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/capabilities/${id}`, getAuthHeaders());
  } catch (error) {
    console.error("Error deleting capability:", error);
    throw error;
  }
};
