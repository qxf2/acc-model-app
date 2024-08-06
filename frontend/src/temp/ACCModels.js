import React, { useState, useEffect } from 'react';
import { Container, Typography, List, ListItem, ListItemText, Button, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText } from '@mui/material';
import api from '../services/api';
import ACCModelForm from '../components/ACCModelForm';

function ACCModels() {
  const [accModels, setAccModels] = useState([]);
  const [selectedACCModel, setSelectedACCModel] = useState(null);
  const [error, setError] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('create'); // 'create' or 'edit'

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

  const handleCreateSuccess = (newACCModel) => {
    setAccModels((prevACCModels) => [...prevACCModels, newACCModel]);
    setIsDialogOpen(false);
  };

  const handleUpdateSuccess = (updatedACCModel) => {
    setAccModels((prevACCModels) =>
      prevACCModels.map((accModel) =>
        accModel.id === updatedACCModel.id ? updatedACCModel : accModel
      )
    );
    setSelectedACCModel(null);
    setIsDialogOpen(false);
  };

  const handleDeleteSuccess = () => {
    fetchACCModels();
    setSelectedACCModel(null);
    setIsConfirmationDialogOpen(false);
  };

  const handleEditClick = (accModel) => {
    setSelectedACCModel(accModel);
    setDialogMode('edit');
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (accModel) => {
    setSelectedACCModel(accModel);
    setIsConfirmationDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/acc-models/${selectedACCModel.id}`);
      handleDeleteSuccess();
    } catch (error) {
      setError('Error deleting ACC Model');
      console.error('Error deleting ACC Model:', error);
    }
  };

  const handleCloseDialog = () => {
    setSelectedACCModel(null);
    setIsDialogOpen(false);
  };

  const handleCloseConfirmationDialog = () => {
    setSelectedACCModel(null);
    setIsConfirmationDialogOpen(false);
  };

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>ACC Models</Typography>
      <Button variant="contained" color="primary" onClick={() => { setDialogMode('create'); setIsDialogOpen(true); }} style={{ marginBottom: '20px' }}>
        Create ACC Model
      </Button>
      <List>
        {accModels.map((accModel) => (
          <ListItem key={accModel.id} divider>
            <ListItemText
              primary={accModel.name}
              secondary={accModel.description}
            />
            <Button variant="contained" color="secondary" onClick={() => handleEditClick(accModel)} style={{ marginRight: '10px' }}>
              Edit
            </Button>
            <Button variant="contained" color="error" onClick={() => handleDeleteClick(accModel)}>
              Delete
            </Button>
          </ListItem>
        ))}
      </List>
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        sx={{
          '& .MuiDialog-paper': {
            width: '80vw',
            maxWidth: '600px',
            height: '80vh',
            maxHeight: '300px',
            margin: 'auto'
          }
        }}
      >
        <DialogTitle>{dialogMode === 'edit' ? 'Edit ACC Model' : 'Create ACC Model'}</DialogTitle>
        <DialogContent>
          <ACCModelForm
            accModel={dialogMode === 'edit' ? selectedACCModel : null}
            onSuccess={dialogMode === 'edit' ? handleUpdateSuccess : handleCreateSuccess}
            open={isDialogOpen}
            onClose={handleCloseDialog}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">Cancel</Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isConfirmationDialogOpen}
        onClose={handleCloseConfirmationDialog}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this ACC Model?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmationDialog} color="primary">Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ACCModels;
