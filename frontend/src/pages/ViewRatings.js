import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, MenuItem, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import {
  fetchACCModels,
  fetchAttributes,
  fetchComponentsByAccModel,
  fetchCapabilitiesByComponent,
  fetchCapabilityAssessments,
  fetchUserDetails,
  fetchRatings
} from '../services/ratingsService'; 

const ViewCapabilities = () => {
  const [accModels, setAccModels] = useState([]);
  const [selectedAccModel, setSelectedAccModel] = useState('');
  const [components, setComponents] = useState([]);
  const [capabilities, setCapabilities] = useState([]);
  const [expandedComponents, setExpandedComponents] = useState({});
  const [attributes, setAttributes] = useState([]);
  const [capabilityAssessments, setCapabilityAssessments] = useState({}); 
  const [ratings, setRatings] = useState({});
  const [user, setUser] = useState(null);

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
      } catch (error) {
        console.error('Error fetching capability assessments:', error);
      }
    };

    if (capabilities.length > 0 && attributes.length > 0) {
      fetchCapabilityAssessmentsData();
    }
  }, [capabilities, attributes]);

  useEffect(() => {
    const fetchUserDetailsData = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          console.error('User is not authenticated');
          return;
        }
        const userData = await fetchUserDetails(authToken);
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetailsData();
  }, []);

  useEffect(() => {
    const fetchRatingsData = async () => {
      try {
        if (user && Object.keys(capabilityAssessments).length > 0) {
          const ratingsData = await fetchRatings(user, capabilityAssessments);
          setRatings(ratingsData);
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    };

    fetchRatingsData();
  }, [user, capabilityAssessments]);

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
                      {attributes.map((attribute) => (
                        <TableCell key={`${capability.id}-${attribute.id}`}>
                          {ratings[`${capability.id}-${attribute.id}`]?.rating || 'N/A'}
                        </TableCell>
                      ))}
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

export default ViewCapabilities;
