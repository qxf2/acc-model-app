import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const fetchACCModels = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/acc-models`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ACC models:', error);
    throw error;
  }
};

export const fetchAttributes = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/attributes`);
    return response.data;
  } catch (error) {
    console.error('Error fetching attributes:', error);
    throw error;
  }
};

export const fetchComponentsByAccModel = async (accModelId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/components/acc_model/${accModelId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching components:', error);
    throw error;
  }
};

export const fetchCapabilitiesByComponent = async (componentId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/capabilities/component/${componentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching capabilities:', error);
    throw error;
  }
};

export const fetchCapabilityAssessments = async (capabilities, attributes) => {
  try {
    const assessments = {};
    
    for (const cap of capabilities.flatMap(cap => cap.capabilities)) {
      for (const attr of attributes) {
        const params = new URLSearchParams({
          capability_id: cap.id,
          attribute_id: attr.id
        }).toString();
        
        const response = await axios.get(`${API_BASE_URL}/capability-assessments/?${params}`);
        assessments[`${cap.id}-${attr.id}`] = response.data;
      }
    }
    
    return assessments;
  } catch (error) {
    console.error('Error fetching capability assessments:', error);
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
    console.error('Error fetching user details:', error);
    throw error;
  }
};

export const fetchRatings = async (user, capabilityAssessments) => {
  try {
    const ratingsData = {};
    for (const [key, assessment] of Object.entries(capabilityAssessments)) {
      try {
        const response = await axios.get(`${API_BASE_URL}/capability-assessments/${assessment.id}/user/${user.id}/`);
        ratingsData[key] = response.data[0] || {};
      } catch (error) {
        if (error.response && error.response.status === 404) {
          ratingsData[key] = {};
        } else {
          console.error('Error fetching ratings:', error);
          throw error;
        }
      }
    }
    return ratingsData;
  } catch (error) {
    console.error('Error fetching ratings:', error);
    throw error;
  }
};

export const fetchRatingOptions = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/rating-options`);
    return response.data;
  } catch (error) {
    console.error('Error fetching rating options:', error);
    throw error;
  }
};

// export const submitRatings = async (ratings, authToken) => {
//   try {
//     const responses = await Promise.all(
//       ratings.map(rating =>
//         axios.post(
//           `${API_BASE_URL}/capability-assessments/${rating.capabilityAssessmentId}/`,
//           {
//             capability_assessment_id: rating.capabilityAssessmentId,
//             rating: rating.rating,
//             timestamp: new Date().toISOString(),
//           },
//           {
//             headers: { Authorization: `Bearer ${authToken}` },
//           }
//         )
//       )
//     );
//     return responses.map(response => response.data);
//   } catch (error) {
//     console.error('Error submitting ratings:', error);
//     throw error;
//   }
// };


export const submitRating = async (capabilityAssessmentId, ratingValue, authToken) => {
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
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('The user Rating submitted successfully:', response.data);
    const ratingId = response.data.id;
    console.log('Rating ID:', ratingId);
    return ratingId;
  } catch (error) {
    console.error('Error submitting rating:', error);
  }
};


export const submitComments = async (ratingId, comments, authToken) => {
  try {
    const payload = {
      comments: comments,
      timestamp: new Date().toISOString(),
    };

    console.log('Submitting comments with payload:', payload);

    const response = await axios.put(
      `${API_BASE_URL}/capability-assessments/ratings/${ratingId}/`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Comments submitted successfully:', response.data);
  } 
  catch (error) {
    console.error('Error submitting comments:', error.response ? error.response.data : error.message);
    throw error;
  }
};



export const fetchAggregatedRatings = async (capabilityAssessmentId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/capability-assessments/${capabilityAssessmentId}/aggregate`);
    console.log(`Fetched aggregated rating for ${capabilityAssessmentId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching aggregated rating for ${capabilityAssessmentId}:`, error);
    throw error;
  }
};