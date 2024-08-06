import React, { useState, useEffect } from 'react';
import { Container, Typography, List, ListItem, ListItemText, Button, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import api from '../services/api';
import ComponentForm from '../components/ComponentForm';

function Components() {
  const [components, setComponents] = useState([]);
  const [accModels, setAccModels] = useState([]);
  const [selectedAccModel, setSelectedAccModel] = useState('');
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [error, setError] = useState(null);

  const fetchAccModels = async () => {
    try {
      const response = await api.get('/acc-models');
      setAccModels(response.data);
    } catch (error) {
      setError('Error fetching ACC Models');
      console.error('Error fetching ACC Models:', error);
    }
  };

  const fetchComponentsByAccModel = async (accModelId) => {
    try {
      const response = await api.get(`/components/acc_model/${accModelId}`);
      setComponents(response.data);
    } catch (error) {
      setError('Error fetching components');
      console.error('Error fetching components:', error);
    }
  };

  useEffect(() => {
    fetchAccModels();
  }, []);

  const handleCreateSuccess = () => {
    if (selectedAccModel) {
      fetchComponentsByAccModel(selectedAccModel);
    }
    setIsFormDialogOpen(false);
  };

  const handleUpdateSuccess = () => {
    if (selectedAccModel) {
      fetchComponentsByAccModel(selectedAccModel);
    }
    setSelectedComponent(null);
    setIsFormDialogOpen(false);
  };

  const handleDeleteSuccess = () => {
    if (selectedAccModel) {
      fetchComponentsByAccModel(selectedAccModel);
    }
    setSelectedComponent(null);
    setIsConfirmationDialogOpen(false);
  };

  const handleEditClick = (component) => {
    setSelectedComponent(component);
    setIsFormDialogOpen(true);
  };

  const handleDeleteClick = (component) => {
    setSelectedComponent(component);
    setIsConfirmationDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/components/${selectedComponent.id}`);
      handleDeleteSuccess();
    } catch (error) {
      setError('Error deleting component');
      console.error('Error deleting component:', error);
    }
  };

  const handleCloseFormDialog = () => {
    setSelectedComponent(null);
    setIsFormDialogOpen(false);
  };

  const handleCloseConfirmationDialog = () => {
    setSelectedComponent(null);
    setIsConfirmationDialogOpen(false);
  };

  const handleAccModelChange = (event) => {
    const accModelId = event.target.value;
    setSelectedAccModel(accModelId);
    fetchComponentsByAccModel(accModelId);
  };

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Components</Typography>
      <FormControl fullWidth margin="normal" sx={{ marginTop: 2 }}>
        <InputLabel>ACC Model</InputLabel>
        <Select value={selectedAccModel} onChange={handleAccModelChange}>
          {accModels.map((model) => (
            <MenuItem key={model.id} value={model.id}>{model.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setIsFormDialogOpen(true)}
        style={{ marginBottom: '20px' }}
        disabled={!selectedAccModel}
      >
        Create Component
      </Button>
      <List>
        {components.map((component) => (
          <ListItem key={component.id} divider>
            <ListItemText
              primary={<Typography variant="h6" style={{ fontWeight: 'bold' }}>{component.name}</Typography>}
              secondary={<Typography variant="body2">Description: {component.description}</Typography>}
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleEditClick(component)}
              style={{ marginRight: '10px' }}
            >
              Edit
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleDeleteClick(component)}
            >
              Delete
            </Button>
          </ListItem>
        ))}
      </List>
      <ComponentForm
        component={selectedComponent}
        onSuccess={selectedComponent ? handleUpdateSuccess : handleCreateSuccess}
        open={isFormDialogOpen}
        onClose={handleCloseFormDialog}
        accModelId={selectedAccModel}
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
          <Button onClick={handleConfirmDelete} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Components;
