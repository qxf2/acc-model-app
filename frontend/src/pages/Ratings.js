import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, MenuItem, TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar
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
  submitRating,
  submitComments,
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
  const [additionalRatingData, setAdditionalRatingData] = useState({});
  const [ratingId, setRatingId] = useState(null);
  const [selectedRatings, setSelectedRatings] = useState({});
  const [ratingOptions, setRatingOptions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCapability, setCurrentCapability] = useState(null);
  const [currentAttribute, setCurrentAttribute] = useState(null);
  const [comments, setComments] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');


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

          const userSubmittedRatings = {};
          for (const [key, value] of Object.entries(ratingsData)) {
            userSubmittedRatings[key] = value.rating || '';
          }
          console.log('Fetched Ratings Data:', ratingsData);
          console.log('User Submitted Ratings:', userSubmittedRatings);
          setSubmittedRatings(userSubmittedRatings);

          const additionalRatingData = {};
          for (const [key, value] of Object.entries(ratingsData)) {
            additionalRatingData[key] = {
              comments: value.comments || '',
              id: value.id || '',
            };
          }
          console.log('Additional Rating Data:', additionalRatingData);
          setAdditionalRatingData(additionalRatingData);
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
    const key = `${capabilityId}-${attributeId}`;
    const existingComments = additionalRatingData[key]?.comments || '';
    const ratingId = additionalRatingData[key]?.id || '';
    console.log("Fetched Rating ID:", ratingId);
    console.log("Existing Comments:", existingComments);
    setComments(existingComments);
    setRatingId(ratingId);
    setOpenDialog(true);
  };
  
 
  const handleSaveComments = async () => {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        console.error('User is not authenticated');
        return;
      }
  
      if (ratingId) {
        await submitComments(ratingId, comments, authToken);
        console.log(`Comments for Rating ID: ${ratingId} submitted successfully!`);
        setOpenDialog(false);
      } else {
        console.error('Rating ID not found');
      }
    } catch (error) {
      console.error('Error submitting comments:', error);
      alert(`Failed to submit comments.`);
    }
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
          if (!capabilityAssessmentId) {
            console.error(`Capability Assessment ID not found for key: ${key}`);
            return null;
          }
          return {
            capabilityAssessmentId,
            rating: value,
          };
        })
        .filter(entry => entry !== null);
  
      if (ratingsToSubmit.length === 0) {
        console.log('No ratings to submit.');
        return;
      }
  
      const results = await Promise.allSettled(
        ratingsToSubmit.map(({ capabilityAssessmentId, rating }) =>
          submitRating(capabilityAssessmentId, rating, authToken)
        )
      );
  
      const successfulSubmissions = results.filter(result => result.status === 'fulfilled');
      const failedSubmissions = results.filter(result => result.status === 'rejected');
  
      if (failedSubmissions.length > 0) {
        console.error('Some ratings failed to submit:', failedSubmissions);
      }
  
      if (successfulSubmissions.length > 0) {
        console.log('Ratings submitted successfully:', successfulSubmissions.map(r => r.value));
        setSubmittedRatings((prev) => ({
          ...prev,
          ...selectedRatings,
        }));
        setSnackbarMessage('Ratings submitted successfully!');
        setShowSnackbar(true);
      } else {
        console.log('No ratings were successfully submitted.');
      }
    } catch (error) {
      console.error('Error submitting ratings:', error);
      setSnackbarMessage('Failed to submit ratings.');
      setShowSnackbar(true);
    }
  };
  

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Assess Software Capabilities
      </Typography>
      <Typography variant="body1" style={{ marginBottom: '1.5rem' }}>
        Rate each capability against the defined attributes.
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
            <TableRow style={{ backgroundColor: '#f0f0f0' }}>
              <TableCell style={{ fontSize: '1rem', fontWeight: 'bold', border: '1px solid #ddd' }}>
                Components
              </TableCell>
              {attributes.map((attribute) => (
                <TableCell
                  key={attribute.id}
                  style={{ fontSize: '1rem', fontWeight: 'bold', border: '1px solid #ddd' }}
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
                    style={{ fontSize: '1.125rem', border: '1px solid #ddd' }}
                  >
                    <Box display="flex" alignItems="center">
                      <IconButton onClick={() => handleToggleExpand(component.id)}>
                        {expandedComponents[component.id] ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                      <Typography variant="h6" component="h2" style={{ fontSize: '1.125rem' }}>
                        {component.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  {attributes.map((attribute) => (
                    <TableCell key={`${component.id}-${attribute.id}`} style={{ border: '1px solid #ddd' }}>
                    </TableCell>
                  ))}
                </TableRow>
                {expandedComponents[component.id] && capabilities
                  .filter(cap => cap.componentId === component.id)
                  .flatMap(cap => cap.capabilities)
                  .map((capability) => (
                    <TableRow key={capability.id}>
                      <TableCell style={{ paddingLeft: '2rem', fontSize: '1rem', border: '1px solid #ddd' }}>
                        {capability.name}
                      </TableCell>
                      {attributes.map((attribute) => (
                        <TableCell key={`${capability.id}-${attribute.id}`} style={{ border: '1px solid #ddd' }}>
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
                              onChange={(e) => handleRatingChange(capability.id, attribute.id, e.target.value)}
                              fullWidth
                              style={{ fontSize: '0.875rem' }}
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

      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
        message={snackbarMessage}
      />

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
};

export default Ratings;