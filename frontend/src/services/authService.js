import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const refreshToken = async () => {
  try {
    const oldAccessToken = localStorage.getItem('authToken');
    if (!oldAccessToken) {
      throw new Error('No access token available');
    }

    const response = await axios.post(`${API_BASE_URL}/refresh-token`, { access_token: oldAccessToken });
    const { access_token } = response.data;

    localStorage.setItem('authToken', access_token);
    return access_token;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    throw error;
  }
};

export const getAuthHeaders = async () => {
  const token = localStorage.getItem('authToken');
  const tokenExpiry = localStorage.getItem('tokenExpiry');
  const currentTime = Date.now();

  if (token && tokenExpiry && currentTime < parseInt(tokenExpiry, 10)) {
    return {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
  }

  try {
    const newToken = await refreshToken();
    return {
      headers: {
        'Authorization': `Bearer ${newToken}`,
      },
    };
  } catch (error) {
    console.error('Unable to refresh token:', error);
    throw error;
  }
};

export default getAuthHeaders;