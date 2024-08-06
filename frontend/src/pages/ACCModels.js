import React, { useState, useEffect } from 'react';
import { Container, Typography, List, ListItem, ListItemText, Button, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText } from '@mui/material';
import api from '../services/api';
import ACCModelForm from '../components/ACCModelForm';

function ACCModels() {
  const [accModels, setAccModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [error, setError] = useState(null);

  const fetchACCModels = async () => {
    try {
      const response = await api.get('/acc-models');
      setAccModels(response.data);
    } catch (error) {
      setError('Error fetching ACC models');
      console.error('Error fetching ACC models:', error);
    }
  };

  useEffect(() => {
    fetchACCModels();
  }, []);

  const handleCreateSuccess = () => {
    fetchACCModels();
    setIsFormDialogOpen(false);
  };

  const handleUpdateSuccess = () => {
    fetchACCModels();
    setSelectedModel(null);
    setIsFormDialogOpen(false);
  };

  const handleDeleteSuccess = () => {
    fetchACCModels();
    setSelectedModel(null);
    setIsConfirmationDialogOpen(false);
  };

  const handleEditClick = (model) => {
    setSelectedModel(model);
    setIsFormDialogOpen(true);
  };

  const handleDeleteClick = (model) => {
    setSelectedModel(model);
    setIsConfirmationDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/acc-models/${selectedModel.id}`);
      handleDeleteSuccess();
    } catch (error) {
      setError('Error deleting ACC model');
      console.error('Error deleting ACC model:', error);
    }
  };

  const handleCloseFormDialog = () => {
    setSelectedModel(null);
    setIsFormDialogOpen(false);
  };

  const handleCloseConfirmationDialog = () => {
    setSelectedModel(null);
    setIsConfirmationDialogOpen(false);
  };

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>ACC Models</Typography>
      <Button variant="contained" color="primary" onClick={() => setIsFormDialogOpen(true)} style={{ marginBottom: '20px' }}>
        Create ACC Model
      </Button>
      <List>
        {accModels.map((model) => (
          <ListItem key={model.id} divider>
            <ListItemText
              primary={<Typography variant="h6" style={{ fontWeight: 'bold' }}>{model.name}</Typography>}
              secondary={
                <>
                  <Typography variant="body2">Description: {model.description}</Typography>
                </>
              }
            />
            <Button variant="contained" color="secondary" onClick={() => handleEditClick(model)} style={{ marginRight: '10px' }}>
              Edit
            </Button>
            <Button variant="contained" color="error" onClick={() => handleDeleteClick(model)}>
              Delete
            </Button>
          </ListItem>
        ))}
      </List>
      <ACCModelForm
        accModel={selectedModel}
        onSuccess={selectedModel ? handleUpdateSuccess : handleCreateSuccess}
        open={isFormDialogOpen}
        onClose={handleCloseFormDialog}
      />
      <Dialog
        open={isConfirmationDialogOpen}
        onClose={handleCloseConfirmationDialog}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this ACC model?
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

export default ACCModels;
