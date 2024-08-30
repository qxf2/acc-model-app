import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, MenuItem, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import {
  fetchACCModels,
  fetchAttributes,
  fetchComponentsByAccModel,
  fetchCapabilitiesByComponent,
  fetchCapabilityAssessments,
  fetchAggregatedRatings
} from '../services/ratingsService'; 

const THRESHOLD_RATING_MAPPING = {
  "Stable": [3.5, 4],
  "Acceptable": [2.5, 3.49],
  "Low impact": [1.5, 2.49],
  "Critical Concern": [0, 1.49]
};


const AggregateRatings = () => {
  const [accModels, setAccModels] = useState([]);
  const [selectedAccModel, setSelectedAccModel] = useState('');
  const [components, setComponents] = useState([]);
  const [capabilities, setCapabilities] = useState([]);
  const [expandedComponents, setExpandedComponents] = useState({});
  const [attributes, setAttributes] = useState([]);
  const [capabilityAssessments, setCapabilityAssessments] = useState({});
  const [aggregatedRatings, setAggregatedRatings] = useState({});

  function mapRatingToColor(averageRating) {
    for (const [color, range] of Object.entries(THRESHOLD_RATING_MAPPING)) {
      const [min, max] = range;
      if (averageRating >= min && averageRating <= max) {
        return color;
      }
    }
    return "N/A";
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accModelsData = await fetchACCModels();
        setAccModels(accModelsData);

        const attributesData = await fetchAttributes();
        setAttributes(attributesData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedAccModel) {
      const fetchComponentsData = async () => {
        try {
          const componentsData = await fetchComponentsByAccModel(selectedAccModel);
          setComponents(componentsData);
        } catch (error) {
          console.error('Error fetching components:', error);
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
              const capabilitiesData = await fetchCapabilitiesByComponent(component.id);
              return {
                componentId: component.id,
                capabilities: capabilitiesData,
              };
            })
          );
          setCapabilities(allCapabilities);
        } catch (error) {
          console.error('Error fetching capabilities:', error);
        }
      };

      fetchCapabilitiesData();
    }
  }, [components]);

  useEffect(() => {
    const fetchCapabilityAssessmentsData = async () => {
      try {
        const assessments = await fetchCapabilityAssessments(capabilities, attributes);
        setCapabilityAssessments(assessments);
        console.log('Fetched capability assessments:', assessments);

        const aggregatedRatingsData = {};
        for (const [key, assessment] of Object.entries(assessments)) {
          try {
            const { average_rating } = await fetchAggregatedRatings(assessment.id);
            const color = mapRatingToColor(average_rating);
            aggregatedRatingsData[key] = color;
          } catch (error) {
            console.error(`Error fetching aggregated ratings for ${key}:`, error);
          }
        }
        setAggregatedRatings(aggregatedRatingsData);
        console.log('Aggregated ratings:', aggregatedRatingsData);
      } catch (error) {
        console.error('Error fetching capability assessments:', error);
      }
    };

    if (capabilities.length > 0 && attributes.length > 0) {
      fetchCapabilityAssessmentsData();
    }
  }, [capabilities, attributes]);

  const handleToggleExpand = (componentId) => {
    setExpandedComponents(prevState => ({
      ...prevState,
      [componentId]: !prevState[componentId],
    }));
  };

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        View Capabilities
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

      <TableContainer component={Paper} style={{ marginTop: '2rem' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Components</TableCell>
              {attributes.map((attribute) => (
                <TableCell key={attribute.id}>{attribute.name}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {components.map((component) => (
              <React.Fragment key={component.id}>
                <TableRow>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <IconButton onClick={() => handleToggleExpand(component.id)}>
                        {expandedComponents[component.id] ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                      <Typography variant="h6" component="h2" style={{ fontSize: '1.25rem' }}>
                        {component.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  {attributes.map((attribute) => (
                    <TableCell key={`${component.id}-${attribute.id}`}>
                      {/* Empty component row cells */}
                    </TableCell>
                  ))}
                </TableRow>
                {expandedComponents[component.id] && capabilities
                  .filter(cap => cap.componentId === component.id)
                  .flatMap(cap => cap.capabilities)
                  .map((capability) => (
                    <TableRow key={capability.id}>
                      <TableCell style={{ paddingLeft: '2rem' }}>
                        {capability.name}
                      </TableCell>
                      {attributes.map((attribute) => {
                        const capabilityAssessmentId = `${capability.id}-${attribute.id}`;
                        const ratingColor = aggregatedRatings[capabilityAssessmentId] || 'N/A';
                        
                        return (
                          <TableCell key={capabilityAssessmentId} style={{ backgroundColor: mapRatingToColor(ratingColor) }}>
                            {ratingColor}
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

export default AggregateRatings;
