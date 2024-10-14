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

Chart.register(ArcElement);

// Mapping of rating thresholds to descriptions
const THRESHOLD_RATING_MAPPING = {
  Stable: [3.5, 4],
  Acceptable: [2.5, 3.49],
  "Low impact": [1.5, 2.49],
  "Critical Concern": [0, 1.49],
  "Not Applicable": [0, 0],
};

// Maps rating description to corresponding colors used for visualizations
const RATING_COLOR_MAPPING = {
  Stable: "#8BC34A", // Green
  Acceptable: "#A3C1DA",  // Light Blue
  "Low impact": "#f5b877", // Orange
  "Critical Concern": "#e57373", // Red 
  "Not Applicable": "#b0b0b0", // Gray
  "No Rating": "#FAEBD7", // Antique White
};

/**
 * The main component for the dashboard page.
 * It contains the following sub-components:
 * - A dropdown to select an ACC model.
 * - A heatmap to display the ratings of the capabilities in a 2D matrix.
 * - A tree table view to display the components, their capabilities, and the ratings.
 * - A pie chart to display the distribution of the ratings.
 * @returns {React.ReactElement} The JSX element representing the dashboard page.
 */
const Dashboard = () => {
  // State for holding ACC models, selected model, components, capabilities, and other data
  const [accModels, setAccModels] = useState([]);
  const [selectedAccModel, setSelectedAccModel] = useState("");
  const [components, setComponents] = useState([]);
  const [capabilities, setCapabilities] = useState([]);
  const [expandedComponents, setExpandedComponents] = useState({});
  const [attributes, setAttributes] = useState([]);
  const [capabilityAssessments, setCapabilityAssessments] = useState({});
  const [aggregatedRatings, setAggregatedRatings] = useState({});

  /**
   * Returns the rating description for the given average rating.
   * If average rating is null, returns "No Rating".
   * If average rating does not fall within any of the predefined
   * rating thresholds, returns "N/A".
   * @param {number} averageRating
   * @returns {string}
   */
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

  /**
   * Returns the color to be used for visualizations given a rating description.
   * If no color is found in RATING_COLOR_MAPPING, returns "#ffffff".
   * @param {string} ratingDescription
   * @returns {string}
   */
  function mapRatingToColor(ratingDescription) {
    return RATING_COLOR_MAPPING[ratingDescription] || "#ffffff";
  }

  /**
   * Fetches ACC models and attributes when the component mounts.
   * Stores the data in state.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch ACC models
        const accModelsData = await fetchACCModels();
        setAccModels(accModelsData);

        // Fetch attributes
        const attributesData = await fetchAttributes();
        setAttributes(attributesData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    // Call the function to fetch the data, runs once on component mount
    fetchData();
  }, []);

  /**
   * Fetches components for the selected ACC model when the selected ACC model changes.
   * Stores the data in the components state.
   */
  useEffect(() => {
    if (selectedAccModel) {
      const fetchComponentsData = async () => {
        try {
          // Fetch components for the selected ACC model
          const componentsData = await fetchComponentsByAccModel(
            selectedAccModel
          );
          // Store the components in the state
          setComponents(componentsData);
        } catch (error) {
          console.error("Error fetching components:", error);
        }
      };

      // Call the function to fetch the components, runs whenever 'selectedAccModel' changes
      fetchComponentsData();
    }
  }, [selectedAccModel]);

  /**
   * Fetches capabilities for all components when the components change.
   * Stores the data in the capabilities state.
   */
  useEffect(() => {
    if (components.length > 0) {
      const fetchCapabilitiesData = async () => {
        try {
          // Fetch capabilities for all components, (for each component, fetch its associated capabilities and map them to the component ID)
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
          // Store the capabilities in the state
          setCapabilities(allCapabilities);
        } catch (error) {
          console.error("Error fetching capabilities:", error);
        }
      };

      const expanded = {};
      components.forEach((component) => {
        expanded[component.id] = true; // Set all components to expanded by default
      });
      setExpandedComponents(expanded); // Update state with expanded components

      fetchCapabilitiesData();
    }
  }, [components]); // Runs when 'components' array is updated

  
  /**
   * Fetches capability assessments and aggregated ratings 
   * when capabilities and attributes are available.
   */
  useEffect(() => {
    const fetchCapabilityAssessmentsAndRatings = async () => {
      // If there are capabilities and attributes, fetch the capability assessments
      if (capabilities.length > 0 && attributes.length > 0) {
        try {
          // Fetch capability assessment IDs in bulk
          const capabilityIds = capabilities.flatMap((cap) =>
            cap.capabilities.map((c) => c.id)
          );
          const attributeIds = attributes.map((attr) => attr.id);

          const assessmentData = await fetchBulkCapabilityAssessmentIDs(
            capabilityIds,
            attributeIds
          );

          const assessmentMap = {}; // Store the mapping of capability-attribute pairs to assessment IDs
          const assessmentIds = []; // Collect all the capability assessment IDs for fetching ratings

          // Map capability and attribute IDs to capability assessment IDs
          assessmentData.forEach((assessment) => {
            const key = `${assessment.capability_id}-${assessment.attribute_id}`;
            assessmentMap[key] = assessment.capability_assessment_id; // Map capability-attribute pair to assessment ID
            assessmentIds.push(assessment.capability_assessment_id);
          });

          setCapabilityAssessments(assessmentMap);

          // Fetch aggregated ratings for the capability assessments
          const aggregatedRatings = await fetchBulkAggregatedRatings(
            assessmentIds
          );
          
          const aggregatedRatingsMap = {}; // To store rating description for each capability assessment ID
          // Map the aggregated ratings to the assessment IDs
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

    // Trigger data fetch if capabilities and attributes are populated
    if (capabilities.length > 0 && attributes.length > 0) {
      fetchCapabilityAssessmentsAndRatings();
    }
  }, [capabilities, attributes]);

  /**
   * Handles expanding or collapsing a component's capability list
   * @param {number} componentId - ID of the component to expand or collapse
   */
  const handleToggleExpand = (componentId) => {
    setExpandedComponents((prevState) => ({
      ...prevState,   // Copy previous state
      [componentId]: !prevState[componentId],
    }));
  };

  /**
   * Calculates the count of each rating description in the aggregated ratings.
   * @returns {Object} A mapping of rating description to count.
   */
  const getRatingCounts = () => {
    const counts = {
      Stable: 0,
      Acceptable: 0,
      "Low impact": 0,
      "Critical Concern": 0,
      "Not Applicable": 0,
    };

    // Iterate through all aggregated ratings and increment the count for the respective rating category
    Object.values(aggregatedRatings).forEach((ratingDescription) => {
      counts[ratingDescription] = (counts[ratingDescription] || 0) + 1;
    });

    return counts;
  };

  // Calculate the count of each rating  in the aggregated ratings
  const ratingCounts = getRatingCounts();

  // Create data for the pie chart
  const pieData = {
    labels: Object.keys(ratingCounts),
    datasets: [
      {
        label: "# of Capabilities",
        // Data values for each wedge of the pie chart
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

  // Configure the pie chart to be responsive and not maintain its aspect ratio.
  // This ensures the chart is displayed with a consistent size, regardless of the
  // available space.
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    // The main container for the page.
    <Container
      maxWidth="xl"
      className="custom-container"
    >
      {/* The title of the page. */}
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ color: "primary.main" }}
      >
        Capability Ratings Dashboard
      </Typography>

      {/* The description of the page. */}
      <Typography
        variant="body1"
        style={{ marginBottom: "1.5rem", color: "#7f8c8d" }}
      >
        Review and analyze the consolidated ratings for each capability. This
        dashboard provides an overview of user evaluations across all
        capabilities, helping you identify strengths, areas for improvement, and
        overall performance.
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
      
      {/* Heatmap */}
      {selectedAccModel && (
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <TableContainer
              component={Paper}
              style={{
                height: "300px", // Fixed height for the heatmap
                width: "100%",
                overflow: "hidden", // Ensures table does not overflow
                display: "flex",
                justifyContent: "center",
                backgroundColor: "#f2f2f2",
                padding: "10px",
              }}
            >
              <Table
                style={{
                  border: "1px solid #ddd",
                  width: "100%", //Full width to fill the container
                  height: "100%", // Full height to fill the container
                  tableLayout: "fixed",
                }}
              >
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
                              aggregatedRatings[capabilityAssessmentId] ||
                              "N/A";
                            const ratingColor =
                              mapRatingToColor(ratingDescription);

                            return (
                              <TableCell
                                key={capabilityAssessmentId}
                                style={{
                                  backgroundColor: ratingColor,
                                  fontSize: "0.875rem",
                                  border: "1px solid #ddd",
                                  padding: "2px",
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

          {/* Pie Chart */}
          <Grid item xs={6}>
            <Paper
              style={{
                height: "300px",
                width: "100%",
                padding: "20px",
                backgroundColor: "#f2f2f2",
              }}
            >
              <Pie data={pieData} options={pieOptions} />
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Tree Table View */}
      {selectedAccModel && (
        <Box mt={5}>
          {/* Table to show the component, attribute and capability and their ratings */}
          <Typography variant="h6"></Typography>
          <TableContainer
            component={Paper}
            style={{ marginTop: "2rem", width: "100%", overflow: "auto" }}
          >
            <Table style={{ border: "1px solid #ddd", tableLayout: "fixed" }}>
              <TableHead>
                <TableRow>
                  {/* First table cell for Component/Capability names */}
                  <TableCell
                    style={{
                      width: "200px", // Fixed width for the first column
                      fontSize: "1rem",
                      fontWeight: "bold",
                      border: "1px solid #ddd",
                      color: "#283593",
                      backgroundColor: "#d0d0d0",
                    }}
                  ></TableCell>


                  {/* Show all the attributes as table headers (dynamically render) */}
                  {attributes.map((attribute) => (
                    <TableCell
                      key={attribute.id}
                      style={{
                        width: "100px", // Fixed width for each attribute column
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
                {/* Loop through all the components and their corresponding capabilities */}
                {components.map((component) => (
                  <React.Fragment key={component.id}>
                    <TableRow>
                      <TableCell
                        style={{
                          fontSize: "1.125rem",
                          border: "1px solid #aaa",
                          backgroundColor: "#E0E0E0",
                        }}
                      >
                        <Box display="flex" alignItems="center">
                          {/* Expand or collapse the component */}
                          <IconButton
                            onClick={() => handleToggleExpand(component.id)}
                          >
                            {expandedComponents[component.id] ? (
                              <ExpandLess />
                            ) : (
                              <ExpandMore />
                            )}
                          </IconButton>
                          {/* Show the component name */}
                          <Typography
                            variant="h6"
                            component="h2"
                            style={{ fontSize: "1rem", fontWeight: "bold" }}
                          >
                            {component.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      {/* Show empty cells for the Component row */}
                      {attributes.map((attribute) => (
                        <TableCell
                          key={attribute.id}
                          style={{
                            backgroundColor: "#E0E0E0",
                            border: "1px solid #aaa",
                          }}
                        ></TableCell>
                      ))}
                    </TableRow>

                    {/* Show the capabilities of the component if it is expanded */}
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
                                backgroundColor: "#E0E0E0",
                              }}
                            >
                              {/* Show the capability name indented */}
                              <Box ml={4}>{capability.name}</Box>
                            </TableCell>
                            {/* Show the ratings of the capability for each attribute */}
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
