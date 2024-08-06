import React, { useState, useEffect } from 'react';
import { Container, Typography, List, ListItem, ListItemText, Button, Dialog, DialogActions, DialogContent, DialogTitle, Select, MenuItem, FormControl, InputLabel, DialogContentText } from '@mui/material';
import api from '../services/api';
import ComponentForm from '../components/ComponentForm';
import ComponentUpdateForm from '../components/ComponentUpdateForm';

function Components() {
  const [components, setComponents] = useState([]);
  const [accModels, setAccModels] = useState([]);
  const [selectedComponentId, setSelectedComponentId] = useState(null);
  const [selectedAccModel, setSelectedAccModel] = useState('');
  const [error, setError] = useState(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);

  const fetchComponents = async (accModelId) => {
    try {
      const response = await api.get(`/components?acc_model_id=${accModelId}`);
      setComponents(response.data);
    } catch (error) {
      setError('Error fetching data');
      console.error('Error fetching data:', error);
    }
  };

  const fetchAccModels = async () => {
    try {
      const response = await api.get('/acc-models');
      setAccModels(response.data);
    } catch (error) {
      setError('Error fetching ACC models');
      console.error('Error fetching ACC models:', error);
    }
  };

  useEffect(() => {
    fetchAccModels();
  }, []);

  useEffect(() => {
    if (selectedAccModel) {
      fetchComponents(selectedAccModel);
    }
  }, [selectedAccModel]);

  const handleCreateSuccess = (newComponent) => {
    setComponents((prevComponents) => [...prevComponents, newComponent]);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateSuccess = (updatedComponent) => {
    setComponents((prevComponents) =>
      prevComponents.map((component) =>
        component.id === updatedComponent.id ? updatedComponent : component
      )
    );
    setSelectedComponentId(null);
    setIsUpdateDialogOpen(false);
  };

  const handleDeleteSuccess = (deletedComponentId) => {
    setComponents((prevComponents) =>
      prevComponents.filter((component) => component.id !== deletedComponentId)
    );
  };

  const handleEditClick = (id) => {
    setSelectedComponentId(id);
    setIsUpdateDialogOpen(true);
  };

  const handleDeleteClick = (id) => {
    setSelectedComponentId(id);
    setIsConfirmationDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/components/${selectedComponentId}`);
      handleDeleteSuccess(selectedComponentId);
      setIsConfirmationDialogOpen(false);
    } catch (error) {
      setError('Error deleting component');
      console.error('Error deleting component:', error);
    }
  };

  const handleCloseUpdateDialog = () => {
    setSelectedComponentId(null);
    setIsUpdateDialogOpen(false);
  };

  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
  };

  const handleCloseConfirmationDialog = () => {
    setIsConfirmationDialogOpen(false);
  };

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Components</Typography>
      <FormControl fullWidth variant="outlined" margin="normal">
        <InputLabel id="acc-model-select-label">ACC Model</InputLabel>
        <Select
          labelId="acc-model-select-label"
          value={selectedAccModel}
          onChange={(e) => setSelectedAccModel(e.target.value)}
          label="ACC Model"
        >
          {accModels.map((model) => (
            <MenuItem key={model.id} value={model.id}>
              {model.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button variant="contained" color="primary" onClick={handleOpenCreateDialog} style={{ marginBottom: '20px' }}>
        Create Component
      </Button>
      <List>
        {components.map((component) => (
          <ListItem key={component.id} divider>
            <ListItemText
              primary={<Typography variant="h6" style={{ fontWeight: 'bold' }}>{component.name}</Typography>}
              secondary={
                <>
                  <Typography variant="body2">ACC Model: {component.acc_model_name}</Typography>
                  <Typography variant="body2">Description: {component.description}</Typography>
                </>
              }
            />
            <Button variant="contained" color="secondary" onClick={() => handleEditClick(component.id)} style={{ marginRight: '10px' }}>
              Edit
            </Button>
            <Button variant="contained" color="error" onClick={() => handleDeleteClick(component.id)}>
              Delete
            </Button>
          </ListItem>
        ))}
      </List>
      <Dialog open={isCreateDialogOpen} onClose={handleCloseCreateDialog}>
        <DialogTitle>Create Component</DialogTitle>
        <DialogContent>
          <ComponentForm 
            onSuccess={handleCreateSuccess} 
            onClose={handleCloseCreateDialog}
            accModelId={selectedAccModel}
          />
        </DialogContent>
      </Dialog>
      <ComponentUpdateForm
        componentId={selectedComponentId}
        onSuccess={handleUpdateSuccess}
        open={isUpdateDialogOpen}
        onClose={handleCloseUpdateDialog}
      />
      <Dialog
        open={isConfirmationDialogOpen}
        onClose={handleCloseConfirmationDialog}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this component?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmationDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Components;
