import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Typography,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Tooltip,
} from "@mui/material";
import { ExpandMore, ExpandLess, Edit } from "@mui/icons-material";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import "../App.css";
import {
  fetchACCModels,
  fetchAttributes,
  fetchComponentsByAccModel,
  fetchCapabilitiesByComponent,
  fetchUserDetails,
  fetchRatingOptions,
  submitRating,
  submitComments,
  fetchBulkRatings,
  fetchBulkCapabilityAssessmentIDs,
  fetchCapabilityAssessment,
} from "../services/ratingsService";


/**
 * Component for the ratings page.
 *
 * This component displays a table of ratings for each capability
 * and attribute of the selected ACC model. It also allows the user
 * to select a rating and add comments for each capability.
 *
 * It fetches the ACC models, attributes, components, capabilities, 
 * capability assessments and rating options from the API and stores them in the state.
 *
 * When the user selects a rating or adds comments, it saves the selected rating in the state.
 *
 * When the user submits the ratings, it submits the selected ratings in bulk
 * to the API and shows a notification when the ratings are successfully submitted.
 *
 * If there are any failures while submitting the ratings, it shows an error dialog
 * with the details of the failed submissions.
 *
 * @return {ReactElement} The component for the ratings page.
 */
const Ratings = () => {
  const [accModels, setAccModels] = useState([]);
  const [selectedAccModel, setSelectedAccModel] = useState("");
  const [components, setComponents] = useState([]);
  const [capabilities, setCapabilities] = useState([]);
  const [expandedComponents, setExpandedComponents] = useState({});
  const [attributes, setAttributes] = useState([]);
  const [capabilityAssessments, setCapabilityAssessments] = useState({});
  const [ratings, setRatings] = useState({});
  const [user, setUser] = useState(null);
  const [submittedRatings, setSubmittedRatings] = useState({});
  const [additionalRatingData, setAdditionalRatingData] = useState({});
  const [ratingId, setRatingId] = useState(null);
  const [selectedRatings, setSelectedRatings] = useState({});
  const [ratingOptions, setRatingOptions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [comments, setComments] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [failureDetails, setFailureDetails] = useState([]);
  const [openFailureDialog, setOpenFailureDialog] = useState(false);

  /* Fetches the ACC models and attributes when the component mounts. */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const accModelsData = await fetchACCModels();
        setAccModels(accModelsData);

        const attributesData = await fetchAttributes();
        setAttributes(attributesData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs only once when the component mounts


  /*
   * Fetches the components associated with the selected ACC model and stores
   * them in the components state variable.
   */
  useEffect(() => {
    if (selectedAccModel) {

      const fetchComponentsData = async () => {
        try {
          const componentsData = await fetchComponentsByAccModel(
            selectedAccModel
          );
          setComponents(componentsData);
        } catch (error) {
          console.error("Error fetching components:", error);
        }
      };

      fetchComponentsData(); // Runs whenever `selectedAccModel` changes
    }
  }, [selectedAccModel]);


  /**
   * Fetches the capabilities for all components in the components state
   * variable, mapping each capability to its associated component ID.
   * Stores the capabilities in the capabilities state variable.
   */
  useEffect(() => {
    if (components.length > 0) {
      const fetchCapabilitiesData = async () => {
        try {
          const allCapabilities = await Promise.all(
            components.map(async (component) => {
              const capabilitiesData = await fetchCapabilitiesByComponent(
                component.id
              );
              return {
                componentId: component.id,
                capabilities: capabilitiesData,
              };
            })
          );
          setCapabilities(allCapabilities);
        } catch (error) {
          console.error("Error fetching capabilities:", error);
        }
      };

      fetchCapabilitiesData();
    }
  }, [components]); // Runs whenever `components` changes


  /**
   * Fetches the user details for the currently authenticated user,
   * and stores the result in the `user` state variable.
   * If there is no authenticated user, or error fetching the user details, 
   * logs a console error.
   */
  useEffect(() => {
    const fetchUserDetailsData = async () => {
      try {
        // Retrieves auth token from local storage to authenticate the user
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          console.error("User is not authenticated");
          return;
        }
        const userData = await fetchUserDetails(authToken);
        setUser(userData);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    if (!user) {
      fetchUserDetailsData();
    }
  }, [user]); // Runs when the `user` state changes

  /**
   * Fetches the capability assessments for the current user, given the capabilities
   * and attributes that have been loaded. If either of these are empty, this
   * function simply logs a message and does nothing.
   *
   * The function fetches the capability assessment IDs for the given capability and
   * attribute IDs and then maps the assessment data.
   */
  useEffect(() => {
    const fetchCapabilityAssessmentsData = async () => {
      if (capabilities.length > 0 && attributes.length > 0) {
        try {
          const capabilityIds = capabilities.flatMap((cap) =>
            cap.capabilities.map((c) => c.id)
          );
          const attributeIds = attributes.map((attr) => attr.id);
          const assessmentData = await fetchBulkCapabilityAssessmentIDs(
            capabilityIds,
            attributeIds
          );

          const assessmentMap = {};
          assessmentData.forEach((assessment) => {
            const key = `${assessment.capability_id}-${assessment.attribute_id}`;
            assessmentMap[key] = assessment.capability_assessment_id; // Save the capability_assessment_id
          });

          setCapabilityAssessments(assessmentMap);
        } catch (error) {
          console.error("Error fetching capability assessment data:", error);
        }
      } else {
        console.log("Waiting for capabilities and attributes to be loaded...");
      }
    };
    // Only fetch capability assessments when both capabilities and attributes are loaded
    if (capabilities.length > 0 && attributes.length > 0) {
      fetchCapabilityAssessmentsData();
    }
  }, [capabilities, attributes]); // Runs when `capabilities` or `attributes` state changes

  /**
   * Fetches the ratings data for the current user and capability assessments.
   *
   * The function checks if the user and capability assessments are loaded. If
   * both are loaded, it fetches the ratings data in bulk and populates the
   * `ratings` state with the ratings data. It also populates the
   * `submittedRatings` and `additionalRatingData` states by mapping the ratings
   * data to the capability assessment IDs.
   *
   * If there is an error while fetching the ratings data, the error is logged to
   * the console.
   */
  useEffect(() => {
    const fetchRatingsData = async () => {
      try {
        if (user && Object.keys(capabilityAssessments).length > 0) {
          const capabilityAssessmentIds = Object.values(capabilityAssessments);

          const ratingsData = await fetchBulkRatings(
            user,
            capabilityAssessmentIds
          );
          setRatings(ratingsData);

          const userSubmittedRatings = {};
          const additionalRatingData = {};

          Object.values(ratingsData).forEach((rating) => {
            const key = `${rating.capability_assessment_id}`;
            userSubmittedRatings[key] = rating.rating || "";
            additionalRatingData[key] = {
              comments: rating.comments || "",
              id: rating.id || "",
            };
          });

          console.log("User Submitted Ratings:", userSubmittedRatings);
          setSubmittedRatings(userSubmittedRatings);
          setAdditionalRatingData(additionalRatingData);
        }
      } catch (error) {
        console.error("Error fetching ratings:", error);
      }
    };

    // Fetch ratings only when the user is set and capability assessments are available
    if (user && Object.keys(capabilityAssessments).length > 0) {
      fetchRatingsData();
    }
  }, [user, capabilityAssessments]); // Runs when `user` or `capabilityAssessments` state changes

  /**
   * Fetches the rating options from the API and sets the fetched options into state
   */
  useEffect(() => {
    const fetchRatingOptionsData = async () => {
      try {
        const options = await fetchRatingOptions();
        setRatingOptions(options);
      } catch (error) {
        console.error("Error fetching rating options:", error);
      }
    };
     // Only fetch rating options if they have not been loaded yet
    if (!ratingOptions || ratingOptions.length === 0) {
      fetchRatingOptionsData(); // Only runs when `ratingOptions` state changes
    }
  });

  /**
   * Updates the selected ratings in the state with the newly selected value.
   *
   * @param {string} capabilityId The ID of the capability
   * @param {string} attributeId The ID of the attribute
   * @param {string} value The newly selected rating value
   */
  const handleRatingChange = (capabilityId, attributeId, value) => {
    setSelectedRatings((prev) => ({
      ...prev,
      [`${capabilityId}-${attributeId}`]: value,
    }));
  };

  /**
   * Handles expanding or collapsing a component's capability list
   * @param {number} componentId - ID of the component to expand or collapse
   */
  const handleToggleExpand = (componentId) => {
    setExpandedComponents((prevState) => ({
      ...prevState,
      [componentId]: !prevState[componentId],
    }));
  };

  /**
   * Handles the edit button click by fetching the latest capability assessment
   * data for the given capability and attribute, and then opens the modal dialog
   * with the existing rating and comments pre-populated.
   * @param {string} capabilityId The ID of the capability
   * @param {string} attributeId The ID of the attribute
   */
  const handleEditClick = async (capabilityId, attributeId) => {
    const assessmentKey = `${capabilityId}-${attributeId}`;

    const capabilityAssessmentId = capabilityAssessments[assessmentKey];
    if (!capabilityAssessmentId) {
      console.error(
        `Capability Assessment ID not found for key: ${assessmentKey}`
      );
      return;
    }

    try {
      const assessmentData = await fetchCapabilityAssessment(
        capabilityAssessmentId
      );

      if (assessmentData && assessmentData.length > 0) {
        const latestAssessment = assessmentData[0];

        const existingComments = latestAssessment.comments || "";
        const ratingId = latestAssessment.id || "";
        setComments(existingComments);
        setRatingId(ratingId);
        setOpenDialog(true);
      } else {
        console.error(
          "No assessment data found for capability assessment ID:",
          capabilityAssessmentId
        );
      }
    } catch (error) {
      console.error("Error fetching capability assessment data:", error);
    }
  };
  /**
   * Handles the submission of the ratings in a batch.
   *
   * Filters the currently selected ratings to only include the ones that have
   * not been previously submitted. Submits each rating in parallel, and shows a
   * snackbar with the results. If there are any failures, opens an error dialog
   * with the details of the failed submissions.
   */
  const handleBatchSubmit = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        console.error("User is not authenticated");
        return;
      }

      // Filter the selected ratings to only include the ones that have not been previously submitted
      const ratingsToSubmit = Object.entries(selectedRatings)
        .filter(([key, value]) => value !== submittedRatings[key])
        .map(([key, value]) => {
          const capabilityAssessmentId = capabilityAssessments[key];
          if (!capabilityAssessmentId) {
            console.error(`Capability Assessment ID not found for key: ${key}`);
            return null;
          }
          return {
            capabilityAssessmentId,
            rating: value,
            key,
          };
        })
        .filter((entry) => entry !== null);

      if (ratingsToSubmit.length === 0) {
        console.log("No ratings to submit.");
        return;
      }

      // Submit the ratings in parallel
      const results = await Promise.allSettled(
        ratingsToSubmit.map(async ({ capabilityAssessmentId, rating, key }) => {
          const ratingId = await submitRating(
            capabilityAssessmentId,
            rating,
            authToken
          );

          // Save the rating ID to the additional rating data
          setAdditionalRatingData((prev) => ({
            ...prev,
            [key]: {
              ...(prev[key] || {}),
              id: ratingId,
            },
          }));

          // Return the result with the key and rating ID
          return { key, ratingId };
        })
      );

      // Split the results into successful and failed submissions
      const successfulSubmissions = results.filter(
        (result) => result.status === "fulfilled"
      );
      const failedSubmissions = results.filter(
        (result) => result.status === "rejected"
      );

      // If there are any failed submissions, open an error dialog with the details
      if (failedSubmissions.length > 0) {
        console.error("Some ratings failed to submit:", failedSubmissions);
        const failureDetails = failedSubmissions.map((failure) => ({
          key: failure.reason.key,
          reason: failure.reason.message || "Unknown error",
        }));
        setFailureDetails(failureDetails);
        setOpenFailureDialog(true);
      }

      // If there are any successful submissions, show a success snackbar
      if (successfulSubmissions.length > 0) {
        console.log(
          "Ratings submitted successfully:",
          successfulSubmissions.map((r) => r.value)
        );
        setSubmittedRatings((prev) => ({
          ...prev,
          ...selectedRatings,
        }));
        setSnackbarMessage("Ratings submitted successfully!");
        setShowSnackbar(true);
      } else {
        console.log("No ratings were successfully submitted.");
      }
    } catch (error) {
      console.error("Error submitting ratings:", error);
      setSnackbarMessage("Failed to submit ratings.");
      setShowSnackbar(true);
    }
  };

  /**
   * Saves the comments for a given rating ID.
   * @param {string} ratingId - The ID of the rating to save comments for.
   * @param {string} comments - The comments to save for the given rating ID.
   * @return {Promise} A promise that resolves when the comments have been saved.
   */
  const handleSaveComments = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        console.error("User is not authenticated");
        return;
      }

      if (!ratingId) {
        console.error("Rating ID not found");
        setSnackbarMessage("Please submit a rating before adding a comment.");
        setShowSnackbar(true);
        return;
      }

      await submitComments(ratingId, comments, authToken);
      console.log(
        `Comments for Rating ID: ${ratingId} submitted successfully!`
      );
      setOpenDialog(false);
    } catch (error) {
      console.error("Error submitting comments:", error);
      alert("Failed to submit comments.");
      setShowSnackbar(true);
    }
  };

  return (
    // The main container for the page.
    <Container
      maxWidth="xl"
      className="custom-container"
    >
      {/* The title of the page */}
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ color: "primary.main" }}
      >
        Assess Software Capabilities      
      </Typography>

      {/* The description for the page. */}
      <Typography 
        variant="body1"
        style={{ marginBottom: "1.5rem", color: "#7f8c8d" }}
      >
        Rate the effectiveness of each Capability based on its performance. Your
        ratings help assess how well each feature meets the intended quality
        standards.

        <br />
        <br />
        Select an ACC Model first. Then, expand components to reveal their capabilities. 
        You can select multiple ratings and click the 'Submit All Ratings' button at the 
        bottom of the page to save your ratings
      </Typography>

      {/* Dropdown to select an ACC model. */}
      <TextField
        select
        label="Select ACC Model"
        value={selectedAccModel}
        onChange={(e) => setSelectedAccModel(e.target.value)}
        fullWidth
        margin="normal"
      >
        {/* Generate options for each ACC model. */}
        {accModels.map((model) => (
          <MenuItem key={model.id} value={model.id}>
            {model.name}
          </MenuItem>
        ))}
      </TextField>
        
      {/* Container for the table that displays the ratings */}
      <TableContainer 
        component={Paper} 
        style={{ marginTop: "2rem", width: "100%", overflow: "auto" }}>
        {/* The table that displays the ratings */}
        <Table 
          style={{ border: "1px solid #ddd", tableLayout: "fixed" }}
        >
          <TableHead>
            <TableRow>
              {/* The first column which shows the component name */}
              <TableCell
                style={{
                  width: "200px", // Fixed width for the first column
                  fontSize: "1rem",
                  fontWeight: "bold",
                  border: "1px solid #ddd",
                  color: "#283593",
                  backgroundColor: "#d0d0d0",
                }}
              >
              </TableCell>

              {/* Generate table header cells (attribute's name.) */}
              {attributes.map((attribute) => (
                <TableCell
                  key={attribute.id}
                  style={{
                    width: "180px", // Fixed width for each attribute column
                    fontSize: "1rem",
                    fontWeight: "bold",
                    border: "1px solid #ddd",
                    color: "#283593",
                    backgroundColor: "#d0d0d0",
                    minWidth: "150px", // Ensures each column has a minimum width
                    overflowWrap: "break-word", // Allow long text to wrap
                    whiteSpace: "normal", // Prevents long words from overflowing
                  }}
                >
                  {attribute.name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Generate rows for each component */}
            {components.map((component) => (
              <React.Fragment key={component.id}>
                {/* The first row for the component (with the component name) */}
                <TableRow>
                  <TableCell
                    style={{ 
                      fontSize: "1.125rem",
                      border: "1px solid #ddd",
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      {/* Expand/collapse the component's rows */}
                      <IconButton
                        onClick={() => handleToggleExpand(component.id)}
                      >
                        {expandedComponents[component.id] ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        )}
                      </IconButton>
                      {/* The component name */}
                      <Typography
                        variant="h6"
                        component="h2"
                        style={{ fontSize: "1.125rem", fontWeight: "bold" }}
                      >
                        {component.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  {/* Empty cells for the component's row */}
                  {attributes.map((attribute) => (
                    <TableCell
                      key={`${component.id}-${attribute.id}`}
                      style={{ border: "1px solid #ddd" }}
                    ></TableCell>
                  ))}
                </TableRow>

                {/* Generate rows for each capability of the component */}
                {expandedComponents[component.id] &&
                  capabilities
                    .filter((cap) => cap.componentId === component.id)
                    .flatMap((cap) => cap.capabilities)
                    .map((capability) => (
                      <TableRow key={capability.id}>
                        {/* The first column with the capability name */}
                        <TableCell
                          style={{
                            paddingLeft: "2rem",
                            fontSize: "1rem",
                            border: "1px solid #ddd",
                          }}
                        >
                          {capability.name}
                        </TableCell>
                        {/* Generate cells for each attribute of the capability */}
                        {attributes.map((attribute) => (
                          <TableCell
                            key={`${capability.id}-${attribute.id}`}
                            style={{ border: "1px solid #ddd" }}
                          >
                            {/* Container for the rating and edit buttons */}
                            <Box display="flex" alignItems="center">
                              {/* Rating dropdown */}
                              <TextField
                                select
                                label="Rate"
                                value={(() => {
                                  const key = `${capability.id}-${attribute.id}`;
                                  const capabilityAssessmentId =
                                    capabilityAssessments[key];

                                  const selected = selectedRatings[key];
                                  const submitted =
                                    submittedRatings[capabilityAssessmentId];

                                  return selected || submitted || "";
                                })()}
                                onChange={(e) =>
                                  handleRatingChange(
                                    capability.id,
                                    attribute.id,
                                    e.target.value
                                  )
                                }
                                fullWidth
                                style={{ fontSize: "0.875rem" }}
                              >
                                {/* Generate options for the rating dropdown */}
                                {ratingOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
                              {/* Edit button */}
                              <IconButton
                                aria-label="edit"
                                size="small"
                                onClick={() =>
                                  handleEditClick(capability.id, attribute.id)
                                }
                              >
                                <Tooltip
                                  title={
                                    !selectedRatings[
                                      `${capability.id}-${attribute.id}`
                                    ]
                                      ? "Submit a rating before adding comments"
                                      : "Add comments"
                                  }
                                >
                                  <Edit fontSize="small" />
                                </Tooltip>
                              </IconButton>
                            </Box>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Button to submit all the ratings at once */}
      <Button
        variant="contained"
        color="primary"
        style={{ marginTop: "2rem" }}
        onClick={handleBatchSubmit}
      >
        Submit All Ratings
      </Button>

      {/* Notification for the user when the ratings are successfully submitted */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        message={snackbarMessage}
      />

      {/* Dialog for the user to add comments for a rating */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Comments</DialogTitle>
        <DialogContent>
          {/* Text field for the comments */}
          <TextField
            label="Comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            multiline
            rows={4}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          {/* Cancel button */}
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          {/* Save button */}
          <Button onClick={handleSaveComments} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog to show the user which ratings failed to submit */}
      <Dialog
        open={openFailureDialog}
        onClose={() => setOpenFailureDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Submission Failed</DialogTitle>
        <DialogContent>
          {/* List of failed ratings */}
          {failureDetails.length > 0 ? (
            <List>
              {failureDetails.map((detail, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={`Failed to submit rating for ${detail.key}`}
                    secondary={detail.reason}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No ratings failed to submit.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          {/* Close button */}
          <Button onClick={() => setOpenFailureDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>    
      </Container>
  );
};

export default Ratings;
