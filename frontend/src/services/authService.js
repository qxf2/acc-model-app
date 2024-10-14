import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/**
 * Refreshes an access token by making a request to the server with the current
 * token. If the refresh is successful, the new access token is stored in
 * localStorage and returned. If the refresh fails, an error is thrown.
 *
 * @returns {Promise<string>} The new access token.
 * @throws {Error} If the refresh fails.
 */
export const refreshToken = async () => {
  try {
    const oldAccessToken = localStorage.getItem("authToken");
    if (!oldAccessToken) {
      throw new Error("No access token available");
    }

    const response = await axios.post(`${API_BASE_URL}/refresh-token`, {
      access_token: oldAccessToken,
    });
    const { access_token } = response.data;

    localStorage.setItem("authToken", access_token);
    return access_token;
  } catch (error) {
    console.error("Failed to refresh token:", error);
    throw error;
  }
};

/**
 * Returns an object with an Authorization header containing a Bearer token.
 * If the token has expired, it will be refreshed using the refreshToken
 * function. If the refresh fails, an error is thrown.
 *
 * @returns {object} An object containing an Authorization header with a
 *   Bearer token.
 * @throws {Error} If the refresh fails.
 */
export const getAuthHeaders = async () => {
  const token = localStorage.getItem("authToken");
  const tokenExpiry = localStorage.getItem("tokenExpiry");
  const currentTime = Date.now();

  if (token && tokenExpiry && currentTime < parseInt(tokenExpiry, 10)) {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  try {
    const newToken = await refreshToken();
    return {
      headers: {
        Authorization: `Bearer ${newToken}`,
      },
    };
  } catch (error) {
    console.error("Unable to refresh token:", error);
    throw error;
  }
};

export default getAuthHeaders;
