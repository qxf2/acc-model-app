import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const fetchACCModels = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/acc-models`);
    return response.data;
  } catch (error) {
    console.error("Error fetching ACC models:", error);
    throw error;
  }
};

export const fetchAttributes = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/attributes`);
    return response.data;
  } catch (error) {
    console.error("Error fetching attributes:", error);
    throw error;
  }
};

export const fetchComponentsByAccModel = async (accModelId) => {
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

export const fetchCapabilitiesByComponent = async (componentId) => {
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

export const fetchCapabilityAssessments = async (capabilities, attributes) => {
  try {
    const assessments = {};

    for (const cap of capabilities.flatMap((cap) => cap.capabilities)) {
      for (const attr of attributes) {
        const params = new URLSearchParams({
          capability_id: cap.id,
          attribute_id: attr.id,
        }).toString();

        const response = await axios.get(
          `${API_BASE_URL}/capability-assessments/?${params}`
        );
        assessments[`${cap.id}-${attr.id}`] = response.data;
      }
    }

    return assessments;
  } catch (error) {
    console.error("Error fetching capability assessments:", error);
    throw error;
  }
};

export const fetchBulkCapabilityAssessmentIDs = async (capabilityIds, attributeIds) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/capability-assessments/bulk/ids`,
      { capability_ids: capabilityIds, attribute_ids: attributeIds }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching capability assessment IDs:", error);
    throw error;
  }
};

export const fetchUserDetails = async (authToken) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/users/me/`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw error;
  }
};

export const fetchBulkRatings = async (user, capabilityAssessments) => {
  try {
    const capabilityAssessmentIds = capabilityAssessments;

    const response = await axios.post(`${API_BASE_URL}/capability-assessments/ratings/batch/`, capabilityAssessmentIds, {
      params: {
        user_id: user.id,
      },
    });

    const ratingsData = {};
    response.data.forEach(rating => {
      ratingsData[rating.capability_assessment_id] = rating;
    });

    return ratingsData;
  } catch (error) {
    console.error("Error fetching ratings:", error);
    throw error;
  }
};

export const fetchRatingOptions = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/rating-options`);
    return response.data;
  } catch (error) {
    console.error("Error fetching rating options:", error);
    throw error;
  }
};

export const submitRating = async (
  capabilityAssessmentId,
  ratingValue,
  authToken
) => {
  try {
    const payload = {
      capability_assessment_id: capabilityAssessmentId,
      rating: ratingValue,
      timestamp: new Date().toISOString(),
    };

    const response = await axios.post(
      `${API_BASE_URL}/capability-assessments/${capabilityAssessmentId}/`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    const ratingId = response.data.id;
    return ratingId;
  } catch (error) {
    console.error("Error submitting rating:", error);
  }
};

export const submitComments = async (ratingId, comments, authToken) => {
  try {
    const payload = {
      comments: comments,
      timestamp: new Date().toISOString(),
    };
    const response = await axios.put(
      `${API_BASE_URL}/capability-assessments/ratings/${ratingId}/`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error(
      "Error submitting comments:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

export const fetchAggregatedRating = async (capabilityAssessmentId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/capability-assessments/${capabilityAssessmentId}/aggregate`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching aggregated rating for ${capabilityAssessmentId}:`,
      error
    );
    throw error;
  }
};

export const fetchBulkAggregatedRatings = async (capabilityAssessmentIds) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/capability-assessments/aggregates`,
      capabilityAssessmentIds
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching bulk aggregated ratings:", error);
    throw error;
  }
};

export const submitRatingsBatch = async (ratings, authToken) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/capability-assessments/batch/`,
      { ratings },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Batch ratings submitted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error submitting batch ratings:", error);
    throw error;
  }
};

export const fetchCapabilityAssessment = async (capabilityAssessmentId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/capability-assessments/${capabilityAssessmentId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      }
    );

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`Failed to fetch data, status code: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching capability assessment:", error);
    throw error;
  }
};


export const fetchHistoricalGraphData = async (capabilityAssessmentIds, startDate, endDate) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/capability-assessments/historical-graph-data?start_date=${startDate}&end_date=${endDate}`,
      capabilityAssessmentIds
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching historical graph data:", error);
    throw error;
  }
};
