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
import {
  ExpandMore,
  ExpandLess,
  Edit,
} from "@mui/icons-material";
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
  }, []);

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

      fetchComponentsData();
    }
  }, [selectedAccModel]);

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
  }, [components]);

  useEffect(() => {
    const fetchUserDetailsData = async () => {
      try {
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
  }, [user]);

  useEffect(() => {
    const fetchCapabilityAssessmentsData = async () => {
      console.log("Trying to bulk fetch the capability assessments");

      if (capabilities.length > 0 && attributes.length > 0) {
        try {
          const capabilityIds = capabilities.flatMap((cap) =>
            cap.capabilities.map((c) => c.id)
          );
          const attributeIds = attributes.map((attr) => attr.id);

          console.log("Capability IDs:", capabilityIds);
          console.log("Attribute IDs:", attributeIds);

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
          console.log("Capability Assessments:", assessmentMap);
        } catch (error) {
          console.error("Error fetching capability assessment data:", error);
        }
      } else {
        console.log("Waiting for capabilities and attributes to be loaded...");
      }
    };

    if (capabilities.length > 0 && attributes.length > 0) {
      fetchCapabilityAssessmentsData();
    }
  }, [capabilities, attributes]);

  useEffect(() => {
    const fetchRatingsData = async () => {
      try {
        if (user && Object.keys(capabilityAssessments).length > 0) {
          const capabilityAssessmentIds = Object.values(capabilityAssessments);

          const ratingsData = await fetchBulkRatings(
            user,
            capabilityAssessmentIds
          );
          console.log("The ratings Data set in bulk is", ratingsData);
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
          console.log(
            "Populated Additional Rating Data:",
            additionalRatingData
          );

          setSubmittedRatings(userSubmittedRatings);
          setAdditionalRatingData(additionalRatingData);
        }
      } catch (error) {
        console.error("Error fetching ratings:", error);
      }
    };

    if (user && Object.keys(capabilityAssessments).length > 0) {
      fetchRatingsData();
    }
  }, [user, capabilityAssessments]);

  useEffect(() => {
    const fetchRatingOptionsData = async () => {
      try {
        const options = await fetchRatingOptions();
        setRatingOptions(options);
      } catch (error) {
        console.error("Error fetching rating options:", error);
      }
    };

    if (!ratingOptions || ratingOptions.length === 0) {
      fetchRatingOptionsData();
    }
  });

  const handleRatingChange = (capabilityId, attributeId, value) => {
    setSelectedRatings((prev) => ({
      ...prev,
      [`${capabilityId}-${attributeId}`]: value,
    }));
  };

  const handleToggleExpand = (componentId) => {
    setExpandedComponents((prevState) => ({
      ...prevState,
      [componentId]: !prevState[componentId],
    }));
  };

  const handleEditClick = async (capabilityId, attributeId) => {
    console.log(
      `Edit clicked for Capability ID: ${capabilityId}, Attribute ID: ${attributeId}`
    );
    const assessmentKey = `${capabilityId}-${attributeId}`;

    const capabilityAssessmentId = capabilityAssessments[assessmentKey];
    console.log(
      "The capability assessment id retreived after click is ",
      capabilityAssessmentId
    );

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

        console.log("Fetched Rating ID from API:", ratingId);
        console.log("Existing Comments from API:", existingComments);

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

  const handleBatchSubmit = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        console.error("User is not authenticated");
        return;
      }

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

      const results = await Promise.allSettled(
        ratingsToSubmit.map(async ({ capabilityAssessmentId, rating, key }) => {
          const ratingId = await submitRating(
            capabilityAssessmentId,
            rating,
            authToken
          );

          setAdditionalRatingData((prev) => ({
            ...prev,
            [key]: {
              ...(prev[key] || {}),
              id: ratingId,
            },
          }));

          return { key, ratingId };
        })
      );

      const successfulSubmissions = results.filter(
        (result) => result.status === "fulfilled"
      );
      const failedSubmissions = results.filter(
        (result) => result.status === "rejected"
      );

      if (failedSubmissions.length > 0) {
        console.error("Some ratings failed to submit:", failedSubmissions);
        const failureDetails = failedSubmissions.map((failure) => ({
          key: failure.reason.key,
          reason: failure.reason.message || "Unknown error",
        }));
        setFailureDetails(failureDetails);
        setOpenFailureDialog(true);
      }

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
    <Container maxWidth="xl" 
    style={{ marginTop: "2rem", paddingLeft: "1rem", paddingRight: "1rem"}}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ color: "primary.main" }}
      >
        Assess Software Capabilities
      </Typography>
      <Typography variant="body1" sx={{ marginBottom: 3, color: "#7f8c8d" }}>
        Rate the effectiveness of each Capability based on its performance. Your
        ratings help assess how well each feature meets the intended quality
        standards.
      </Typography>

      <TextField
        select
        label="Select ACC Model"
        value={selectedAccModel}
        onChange={(e) => setSelectedAccModel(e.target.value)}
        fullWidth
        margin="normal"
      >
        {accModels.map((model) => (
          <MenuItem key={model.id} value={model.id}>
            {model.name}
          </MenuItem>
        ))}
      </TextField>

      <TableContainer component={Paper} style={{ marginTop: "2rem" }}>
        <Table style={{ tableLayout: "fixed", width: "100%" }}>
          <TableHead>
            <TableRow style={{ backgroundColor: "#f0f0f0" }}>
              <TableCell className="fixed-column fixed-column-capability">
                Capabilities/Attributes
              </TableCell>
              {attributes.map((attribute) => (
                <TableCell
                  key={attribute.id}
                  style={{
                    fontSize: "1rem",
                    fontWeight: "bold",
                    border: "1px solid #ddd",
                    color: "#283593",
                    backgroundColor: "#f0f0f0",
                  }}
                >
                  {attribute.name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {components.map((component) => (
              <React.Fragment key={component.id}>
                <TableRow>
                  <TableCell
                    style={{ fontSize: "1.125rem", border: "1px solid #ddd" }}
                  >
                    <Box display="flex" alignItems="center">
                      <IconButton
                        onClick={() => handleToggleExpand(component.id)}
                      >
                        {expandedComponents[component.id] ? (
                          <ExpandLess />
                        ) : (
                          <ExpandMore />
                        )}
                      </IconButton>
                      <Typography
                        variant="h6"
                        component="h2"
                        style={{ fontSize: "1.125rem", fontWeight: "bold" }}
                      >
                        {component.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  {attributes.map((attribute) => (
                    <TableCell
                      key={`${component.id}-${attribute.id}`}
                      style={{ border: "1px solid #ddd" }}
                    ></TableCell>
                  ))}
                </TableRow>
                {expandedComponents[component.id] &&
                  capabilities
                    .filter((cap) => cap.componentId === component.id)
                    .flatMap((cap) => cap.capabilities)
                    .map((capability) => (
                      <TableRow key={capability.id}>
                        <TableCell
                          style={{
                            paddingLeft: "2rem",
                            fontSize: "1rem",
                            border: "1px solid #ddd",
                          }}
                        >
                          {capability.name}
                        </TableCell>
                        {attributes.map((attribute) => (
                          <TableCell
                            key={`${capability.id}-${attribute.id}`}
                            style={{ border: "1px solid #ddd" }}
                          >
                            <Box display="flex" alignItems="center">
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
                                {ratingOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </TextField>
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

      <Button
        variant="contained"
        color="primary"
        style={{ marginTop: "2rem" }}
        onClick={handleBatchSubmit}
      >
        Submit All Ratings
      </Button>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        message={snackbarMessage}
      />

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Comments</DialogTitle>
        <DialogContent>
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
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveComments} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openFailureDialog}
        onClose={() => setOpenFailureDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Submission Failed</DialogTitle>
        <DialogContent>
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
          <Button onClick={() => setOpenFailureDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Ratings;
