import axios from "axios";
import getAuthHeaders from "./authService";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const fetchACCModels = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_BASE_URL}/acc-models`, headers);
    return response.data;
  } catch (error) {
    console.error("Error fetching ACC models:", error);
    throw error;
  }
};

export const createACCModel = async (data) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${API_BASE_URL}/acc-models`,
      data,
      headers
    );
    return response.data;
  } catch (error) {
    console.error("Error creating ACC model:", error);
    throw error;
  }
};

export const updateACCModel = async (id, data) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.put(
      `${API_BASE_URL}/acc-models/${id}`,
      data,
      headers
    );
    return response.data;
  } catch (error) {
    console.error("Error updating ACC model:", error);
    throw error;
  }
};

export const deleteACCModel = async (id) => {
  try {
    const headers = await getAuthHeaders();
    await axios.delete(`${API_BASE_URL}/acc-models/${id}`, headers);
  } catch (error) {
    console.error("Error deleting ACC model:", error);
    throw error;
  }
};
