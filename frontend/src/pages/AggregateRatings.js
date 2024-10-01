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
  Grid,
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import {
  fetchACCModels,
  fetchAttributes,
  fetchComponentsByAccModel,
  fetchCapabilitiesByComponent,
  fetchBulkAggregatedRatings,
  fetchBulkCapabilityAssessmentIDs,
} from "../services/ratingsService";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement } from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.register(ArcElement);

const THRESHOLD_RATING_MAPPING = {
  Stable: [3.5, 4],
  Acceptable: [2.5, 3.49],
  "Low impact": [1.5, 2.49],
  "Critical Concern": [0, 1.49],
  "Not Applicable": [0, 0],
};

const RATING_COLOR_MAPPING = {
  Stable: "#8BC34A",
  Acceptable: "#A3C1DA",
  "Low impact": "#f5b877",
  "Critical Concern": "#e57373",
  "Not Applicable": "#b0b0b0",
  "No Rating": "#FAEBD7",
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
    return RATING_COLOR_MAPPING[ratingDescription] || "#ffffff";
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

    const expanded = {};
    components.forEach((component) => {
      expanded[component.id] = true; // Set all components to expanded
    });
    setExpandedComponents(expanded); // Update the expanded state


    fetchCapabilitiesData();
    }
  }, [components]);

  useEffect(() => {
    const fetchCapabilityAssessmentsAndRatings = async () => {
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
          const assessmentIds = [];

          assessmentData.forEach((assessment) => {
            const key = `${assessment.capability_id}-${assessment.attribute_id}`;
            assessmentMap[key] = assessment.capability_assessment_id;
            assessmentIds.push(assessment.capability_assessment_id);
          });

          setCapabilityAssessments(assessmentMap);

          const aggregatedRatings = await fetchBulkAggregatedRatings(
            assessmentIds
          );

          const aggregatedRatingsMap = {};
          aggregatedRatings.forEach((rating) => {
            const description = getRatingDescription(rating.average_rating);
            aggregatedRatingsMap[rating.capability_assessment_id] = description;
          });

          setAggregatedRatings(aggregatedRatingsMap);
        } catch (error) {
          console.error(
            "Error fetching capability assessment data or ratings:",
            error
          );
        }
      }
    };

    if (capabilities.length > 0 && attributes.length > 0) {
      fetchCapabilityAssessmentsAndRatings();
    }
  }, [capabilities, attributes]);

  const handleToggleExpand = (componentId) => {
    setExpandedComponents((prevState) => ({
      ...prevState,
      [componentId]: !prevState[componentId],
    }));
  };

  const getRatingCounts = () => {
    const counts = {
      Stable: 0,
      Acceptable: 0,
      "Low impact": 0,
      "Critical Concern": 0,
      "Not Applicable": 0,
    };

    Object.values(aggregatedRatings).forEach((ratingDescription) => {
      counts[ratingDescription] = (counts[ratingDescription] || 0) + 1;
    });

    return counts;
  };

  const ratingCounts = getRatingCounts();
  const pieData = {
    labels: Object.keys(ratingCounts),
    datasets: [
      {
        label: "# of Capabilities",
        data: Object.values(ratingCounts),
        backgroundColor: Object.keys(RATING_COLOR_MAPPING).map(
          (rating) => RATING_COLOR_MAPPING[rating]
        ),
        hoverBackgroundColor: Object.keys(RATING_COLOR_MAPPING).map(
          (rating) => RATING_COLOR_MAPPING[rating]
        ),
      },
    ],
  };

  // const pieOptions = {
  //   responsive: true,
  //   maintainAspectRatio: false,
  // };
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const dataIndex = tooltipItem.dataIndex;
            const total = tooltipItem.dataset.data.reduce((a, b) => a + b, 0);
            const value = tooltipItem.dataset.data[dataIndex];
            const percentage = ((value / total) * 100).toFixed(2);
            return `${tooltipItem.label}: ${value} (${percentage}%)`;
          },
        },
      },
      legend: {
        display: true,
        position: 'top',
      },
    },
  };
 
 

  return (
    <Container
      maxWidth="xl"
      style={{
        marginTop: "2rem",
        paddingLeft: "0.5rem",
        paddingRight: "0.5rem",
        backgroundColor: "#f7f7f7",
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ color: "primary.main" }}
      >
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

      {selectedAccModel && (
      <Grid container spacing={3}>
        <Grid item xs={6}>
          {/* Heatmap */}
          <TableContainer
            component={Paper}
            style={{
              height: "300px",
              width: "100%",
              overflow: "hidden",
              display: "flex",
              justifyContent: "center",
              backgroundColor: "#f2f2f2",
              padding: "10px",
            }}
          >
            <Table style={{ border: "1px solid #ddd", maxWidth: "100%", tableLayout: "fixed"}}>
              <TableBody>
                {components.map((component) =>
                  capabilities
                    .filter((cap) => cap.componentId === component.id)
                    .flatMap((cap) => cap.capabilities)
                    .map((capability) => (
                      <TableRow key={capability.id}>
                        {attributes.map((attribute) => {
                          const key = `${capability.id}-${attribute.id}`;
                          const capabilityAssessmentId =
                            capabilityAssessments[key];
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
                              {/* Empty cell for heatmap (no rating text) */}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid item xs={6}>
          {/* Pie Chart */}
          <Paper style={{ height: "300px", width: "100%", padding: "20px", backgroundColor: "#f2f2f2" }}>
            <Pie data={pieData} options={pieOptions} />
          </Paper>
        </Grid>
      </Grid>
      )}


{selectedAccModel && (
  <Box mt={5}>
    <Typography variant="h6"></Typography>
    <TableContainer component={Paper} style={{ marginTop: "2rem" }}>
      <Table style={{ border: "1px solid #ddd" }}>
        <TableHead>
          <TableRow>
            <TableCell
              style={{
                width: "200px",
                fontSize: "1rem",
                fontWeight: "bold",
                border: "1px solid #ddd",
                color: "#283593",
                backgroundColor: "#d0d0d0",
              }}
            >
            </TableCell>
            {attributes.map((attribute) => (
              <TableCell
                key={attribute.id}
                style={{
                  width: "100px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  border: "1px solid #ddd",
                  color: "#283593",
                  backgroundColor: "#d0d0d0",
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
                    fontSize: "1.125rem",
                    border: "1px solid #aaa",
                    backgroundColor: "#E0E0E0",  //change this
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
                    key={attribute.id}
                    style={{
                      backgroundColor: "#E0E0E0",  //change this  crea
                      border: "1px solid #aaa",
                    }}
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
                          fontSize: "1rem",
                          border: "1px solid #aaa",
                          backgroundColor: "#E0E0E0", //change this beige
                        }}
                      >
                        <Box ml={4}>{capability.name}</Box>
                      </TableCell>
                      {attributes.map((attribute) => {
                        const key = `${capability.id}-${attribute.id}`;
                        const capabilityAssessmentId =
                          capabilityAssessments[key];
                        const ratingDescription =
                          aggregatedRatings[capabilityAssessmentId] ||
                          "No Rating";
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
  </Box>
)}

    </Container>
  );
};
export default Dashboard;
