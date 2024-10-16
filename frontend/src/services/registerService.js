import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/users/`, userData);
    console.log("Registration response:", response);
    return response;
  } catch (error) {
    console.error("Error during registration:", error);

    if (error.response) {
      const { status, data } = error.response;

      if (status === 422) {
        const validationErrors = data.detail || [];
        const errorMessage = validationErrors
          .map(err => `${err.loc[1]}: ${err.msg}`)
          .join(", ");
        throw new Error(errorMessage);
      }

      if (status === 400) {
        const errorMessage = data.detail || "A registration error occurred.";

        if (errorMessage.includes("User with this username already exists")) {
          throw new Error(
            "User with this username already exists. Please try a different username."
          );
        }

        if (errorMessage.includes("User with this email already exists")) {
          throw new Error(
            "User with this email already exists. Please try a different email."
          );
        }

        throw new Error(errorMessage);
      } else if (status === 500) {
        throw new Error(
          "An unexpected error occurred. Please try again later."
        );
      }
    }

    throw new Error("An unknown error occurred. Please try again.");
  }
};
