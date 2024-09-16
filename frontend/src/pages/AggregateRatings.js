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
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import {
  fetchACCModels,
  fetchAttributes,
  fetchComponentsByAccModel,
  fetchCapabilitiesByComponent,
  fetchCapabilityAssessments,
  fetchAggregatedRatings,
} from "../services/ratingsService";

const THRESHOLD_RATING_MAPPING = {
  Stable: [3.5, 4],
  Acceptable: [2.5, 3.49],
  "Low impact": [1.5, 2.49],
  "Critical Concern": [0, 1.49],
};

const RATING_COLOR_MAPPING = {
  Stable: "#a9d1a1",
  Acceptable: "#f1e0a1",
  "Low impact": "#f5b877",
  "Critical Concern": "#e57373",
  "No Rating": "#e0e0e0",
};

const Dashboard = () => {
  const [accModels, setAccModels] = useState([]);
  const [selectedAccModel, setSelectedAccModel] = useState("");
  const [components, setComponents] = useState([]);
  const [capabilities, setCapabilities] = useState([]);
  const [expandedComponents, setExpandedComponents] = useState({});
  const [attributes, setAttributes] = useState([]);
  const [capabilityAssessments, setCapabilityAssessments] = useState({});
  const [aggregatedRatings, setAggregatedRatings] = useState({});

  function getRatingDescription(averageRating) {
    if (averageRating === null) {
      return "No Rating";
    }
    for (const [description, range] of Object.entries(
      THRESHOLD_RATING_MAPPING
    )) {
      const [min, max] = range;
      if (averageRating >= min && averageRating <= max) {
        return description;
      }
    }
    return "N/A";
  }

  function mapRatingToColor(ratingDescription) {
    return RATING_COLOR_MAPPING[ratingDescription] || "#ffffff"; // Default to white if description is not found
  }

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
    const fetchCapabilityAssessmentsData = async () => {
      try {
        const assessments = await fetchCapabilityAssessments(
          capabilities,
          attributes
        );
        setCapabilityAssessments(assessments);
        console.log("Fetched capability assessments:", assessments);

        const aggregatedRatingsData = {};
        for (const [key, assessment] of Object.entries(assessments)) {
          try {
            const { average_rating } = await fetchAggregatedRatings(
              assessment.id
            );
            const description = getRatingDescription(average_rating);
            aggregatedRatingsData[key] = description;
          } catch (error) {
            console.error(
              `Error fetching aggregated ratings for ${key}:`,
              error
            );
          }
        }
        setAggregatedRatings(aggregatedRatingsData);
        console.log("Aggregated ratings:", aggregatedRatingsData);
      } catch (error) {
        console.error("Error fetching capability assessments:", error);
      }
    };

    if (capabilities.length > 0 && attributes.length > 0) {
      fetchCapabilityAssessmentsData();
    }
  }, [capabilities, attributes]);

  const handleToggleExpand = (componentId) => {
    setExpandedComponents((prevState) => ({
      ...prevState,
      [componentId]: !prevState[componentId],
    }));
  };

  return (
    <Container maxWidth="md" style={{ marginTop: "2rem" }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Capability Ratings Dashboard
      </Typography>
      <Typography
        variant="body1"
        style={{ marginBottom: "1.5rem", color: "#7f8c8d" }}
      >
        Review and analyze the consolidated ratings for each capability. This
        dashboard provides an overview of user evaluations across all
        capabilities, helping you identify strengths, areas for improvement, and
        overall performance.
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
        <Table style={{ border: "1px solid #ddd" }}>
          <TableHead>
            <TableRow>
              <TableCell
                style={{
                  fontSize: "1rem",
                  fontWeight: "bold",
                  border: "1px solid #ddd",
                  color: "#283593",
                  backgroundColor: "#f0f0f0",
                }}
              >
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
                    style={{
                      fontSize: "1.125 rem",
                      border: "1px solid #ddd",
                    }}
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
                        style={{ fontSize: "1rem", fontWeight: "bold" }}
                      >
                        {component.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  {attributes.map((attribute) => (
                    <TableCell
                      key={`${component.id}-${attribute.id}`}
                      style={{ border: "1px solid #ddd" }}
                    >
                      {/* Empty component row cells */}
                    </TableCell>
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
                            fontSize: "0.875rem",
                            border: "1px solid #ddd",
                          }}
                        >
                          {capability.name}
                        </TableCell>
                        {attributes.map((attribute) => {
                          const capabilityAssessmentId = `${capability.id}-${attribute.id}`;
                          const ratingDescription =
                            aggregatedRatings[capabilityAssessmentId] || "N/A";
                          const ratingColor =
                            mapRatingToColor(ratingDescription);

                          return (
                            <TableCell
                              key={capabilityAssessmentId}
                              style={{
                                backgroundColor: ratingColor,
                                fontSize: "0.875rem",
                                border: "1px solid #ddd",
                              }}
                            >
                              {ratingDescription}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Dashboard;
