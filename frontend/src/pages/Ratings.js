import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, MenuItem, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Button, Dialog, DialogActions, DialogContent, DialogTitle
} from '@mui/material';
import { ExpandMore, ExpandLess, Edit } from '@mui/icons-material';
import {
  fetchACCModels,
  fetchAttributes,
  fetchComponentsByAccModel,
  fetchCapabilitiesByComponent,
  fetchCapabilityAssessments,
  fetchUserDetails,
  fetchRatings,
  fetchRatingOptions,
  submitRating
} from '../services/ratingsService';


const Ratings = () => {
  const [accModels, setAccModels] = useState([]);
  const [selectedAccModel, setSelectedAccModel] = useState('');
  const [components, setComponents] = useState([]);
  const [capabilities, setCapabilities] = useState([]);
  const [expandedComponents, setExpandedComponents] = useState({});
  const [attributes, setAttributes] = useState([]);
  const [capabilityAssessments, setCapabilityAssessments] = useState({});
  const [ratings, setRatings] = useState({});
  const [user, setUser] = useState(null);
  const [submittedRatings, setSubmittedRatings] = useState({});
  const [selectedRatings, setSelectedRatings] = useState({});
  const [ratingOptions, setRatingOptions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCapability, setCurrentCapability] = useState(null);
  const [currentAttribute, setCurrentAttribute] = useState(null);
  const [comments, setComments] = useState('');


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
          console.log('Fetched Ratings Data:', ratingsData);
          setRatings(ratingsData);
          const userSubmittedRatings = {};
          for (const [key, value] of Object.entries(ratingsData)) {
            userSubmittedRatings[key] = value.rating || '';
          }
          console.log('Fetched Ratings Data:', ratingsData);
          console.log('User Submitted Ratings:', userSubmittedRatings);
          setSubmittedRatings(userSubmittedRatings);
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    };
  
    fetchRatingsData();
  }, [user, capabilityAssessments]);
  

  useEffect(() => {
    const fetchRatingOptionsData = async () => {
      console.log("Ratings component mounted")
      try {
        const options = await fetchRatingOptions();
        console.log('Rating options are:', options);
        setRatingOptions(options);
      } catch (error) {
        console.error('Error fetching rating options:', error);
      }
    };

    fetchRatingOptionsData();
  }, []);

  const handleRatingChange = (capabilityId, attributeId, value) => {
    setSelectedRatings((prev) => ({
      ...prev,
      [`${capabilityId}-${attributeId}`]: value,
    }));
  };

  const handleToggleExpand = (componentId) => {
    setExpandedComponents(prevState => ({
      ...prevState,
      [componentId]: !prevState[componentId],
    }));
  };

  const handleEditClick = (capabilityId, attributeId) => {
    console.log(`Edit clicked for Capability ID: ${capabilityId}, Attribute ID: ${attributeId}`);
    setCurrentCapability(capabilityId);
    setCurrentAttribute(attributeId);
    setOpenDialog(true);
  };
  

  const handleSaveComments = () => {
    console.log(`Comments for Capability ID: ${currentCapability}, Attribute ID: ${currentAttribute}: ${comments}`);
    setOpenDialog(false);
  };
  
  

  const handleBatchSubmit = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        console.error('User is not authenticated');
        return;
      }
  
      const ratingsToSubmit = Object.entries(selectedRatings)
        .filter(([key, value]) => value !== submittedRatings[key])
        .map(([key, value]) => {
          const capabilityAssessmentId = capabilityAssessments[key]?.id;
  
          return {
            capabilityAssessmentId,
            rating: value,
          };
        });
  
      await Promise.all(
        ratingsToSubmit.map(({ capabilityAssessmentId, rating }) =>
          submitRating(capabilityAssessmentId, rating, authToken)
        )
      );
  
      console.log('All new/modified ratings submitted successfully!');
      
      setSubmittedRatings((prev) => ({
        ...prev,
        ...selectedRatings,
      }));
    } catch (error) {
      console.error('Error submitting ratings:', error);
    }
  };
  

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Provide Ratings
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
                          <Box display="flex" alignItems="center">
                            <TextField
                              select
                              label="Rate"
                              value={
                                (() => {
                                  const key = `${capability.id}-${attribute.id}`;
                                  const selected = selectedRatings[key];
                                  const submitted = submittedRatings[key];
                                  return selected || submitted || '';
                                })()
                              }
                              //value={selectedRatings[`${capability.id}-${attribute.id}`] || submittedRatings[`${capability.id}-${attribute.id}`] || ''}
                              onChange={(e) => handleRatingChange(capability.id, attribute.id, e.target.value)}
                              fullWidth
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
                              onClick={() => handleEditClick(capability.id, attribute.id)}
                            >
                              <Edit fontSize="small" />
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
        style={{ marginTop: '2rem' }}
        onClick={handleBatchSubmit}
      >
        Submit All Ratings
      </Button>
  
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
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
    </Container>
  );
}  

export default Ratings;
