import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Grid, 
  Paper, 
  Typography, 
  Button, 
  Box, 
  CircularProgress, 
  Divider, 
  Container, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle 
} from '@mui/material';
import CapabilityForm from '../components/CapabilityForm';
import CapabilityUpdateForm from '../components/CapabilityUpdateForm';

const Capabilities = () => {
  const [capabilities, setCapabilities] = useState([]);
  const [components, setComponents] = useState({});
  const [attributes, setAttributes] = useState({});
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCapability, setSelectedCapability] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [capabilitiesResponse, componentsResponse, attributesResponse] = await Promise.all([
        axios.get('/capabilities'),
        axios.get('/components'),
        axios.get('/attributes'),
      ]);

      const organizedCapabilities = organizeCapabilitiesData(capabilitiesResponse.data);
      setCapabilities(organizedCapabilities);
      setComponents(mapById(componentsResponse.data));
      setAttributes(mapById(attributesResponse.data));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const mapById = (dataArray) => {
    const map = {};
    dataArray.forEach((item) => {
      map[item.id] = item;
    });
    return map;
  };

  const organizeCapabilitiesData = (data) => {
    const organizedData = {};

    data.forEach((capability) => {
      const { component_id, attribute_id, name, description, rating, id } = capability;

      if (!organizedData[component_id]) {
        organizedData[component_id] = { attributes: {} };
      }
      if (!organizedData[component_id].attributes[attribute_id]) {
        organizedData[component_id].attributes[attribute_id] = [];
      }
      organizedData[component_id].attributes[attribute_id].push({ id, name, description, rating });
    });

    return organizedData;
  };

  const handleEdit = (capability) => {
    console.log("Selected Capability:", capability); // Log the capability to verify
    setSelectedCapability(capability);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/capabilities/${id}`);
      fetchAllData(); // Refresh data after deletion
    } catch (error) {
      console.error('Error deleting capability:', error);
    }
  };

  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedCapability(null);
  };

  const handleCreateSuccess = () => {
    fetchAllData(); // Refresh data after creating a new capability
    setIsCreateDialogOpen(false);
  };

  const handleEditSuccess = () => {
    fetchAllData(); // Refresh data after editing a capability
    setIsEditDialogOpen(false);
    setSelectedCapability(null);
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Capabilities</Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleOpenCreateDialog} 
        style={{ marginBottom: '20px', marginRight: 'auto', display: 'block' }}
      >
        Create Capability
      </Button>
      <Grid container spacing={3}>
        {Object.keys(capabilities).map((componentId) => (
          <Grid item xs={12} key={componentId}>
            <Paper elevation={3} style={{ padding: '20px' }}>
              <Typography variant="h5" gutterBottom style={{ color: '#1976d2' }}>
                {components[componentId]?.name || `Component ID: ${componentId}`}
              </Typography>
              <Grid container spacing={2}>
                {Object.keys(capabilities[componentId].attributes).map((attributeId) => (
                  <Grid item xs={12} sm={6} key={attributeId}>
                    <Paper elevation={1} style={{ padding: '10px', minHeight: '150px' }}>
                      <Typography variant="h6" gutterBottom style={{ color: '#ff9800' }}>
                        {attributes[attributeId]?.name || `Attribute ID: ${attributeId}`}
                      </Typography>
                      {capabilities[componentId].attributes[attributeId].map((capability) => (
                        <Box key={capability.id} mb={2}>
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography variant="body1" fontWeight="bold">
                              {capability.name}
                            </Typography>
                            <Box>
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                style={{ marginRight: '5px' }}
                                onClick={() => handleEdit(capability)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="contained"
                                color="secondary"
                                size="small"
                                onClick={() => handleDelete(capability.id)}
                              >
                                Delete
                              </Button>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="textSecondary">
                            {capability.description}
                          </Typography>
                          <Divider style={{ marginTop: '10px' }} />
                        </Box>
                      ))}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Dialog open={isCreateDialogOpen} onClose={handleCloseCreateDialog}>
        <DialogTitle>Create Capability</DialogTitle>
        <DialogContent>
          <CapabilityForm onSuccess={handleCreateSuccess} open={isCreateDialogOpen} onClose={handleCloseCreateDialog} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog} color="primary">Cancel</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={isEditDialogOpen} onClose={handleCloseEditDialog}>
        <DialogTitle>Edit Capability</DialogTitle>
        <DialogContent>
          <CapabilityUpdateForm 
            capabilityId={selectedCapability?.id} 
            onSuccess={handleEditSuccess} 
            open={isEditDialogOpen} 
            onClose={handleCloseEditDialog} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="primary">Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Capabilities;
