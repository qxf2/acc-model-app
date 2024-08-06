import React, { useState, useEffect } from 'react';
import { Container, Typography, List, ListItem, ListItemText, Button, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText } from '@mui/material';
import api from '../services/api';
import AttributeForm from '../components/AttributeForm';

function Attributes() {
  const [attributes, setAttributes] = useState([]);
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [error, setError] = useState(null);

  const fetchAttributes = async () => {
    try {
      const response = await api.get('/attributes');
      setAttributes(response.data);
    } catch (error) {
      setError('Error fetching attributes');
      console.error('Error fetching attributes:', error);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const handleCreateSuccess = () => {
    fetchAttributes();
    setIsFormDialogOpen(false);
  };

  const handleUpdateSuccess = () => {
    fetchAttributes();
    setSelectedAttribute(null);
    setIsFormDialogOpen(false);
  };

  const handleDeleteSuccess = () => {
    fetchAttributes();
    setSelectedAttribute(null);
    setIsConfirmationDialogOpen(false);
  };

  const handleEditClick = (attribute) => {
    setSelectedAttribute(attribute);
    setIsFormDialogOpen(true);
  };

  const handleDeleteClick = (attribute) => {
    setSelectedAttribute(attribute);
    setIsConfirmationDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/attributes/${selectedAttribute.id}`);
      handleDeleteSuccess();
    } catch (error) {
      setError('Error deleting attribute');
      console.error('Error deleting attribute:', error);
    }
  };

  const handleCloseFormDialog = () => {
    setSelectedAttribute(null);
    setIsFormDialogOpen(false);
  };

  const handleCloseConfirmationDialog = () => {
    setSelectedAttribute(null);
    setIsConfirmationDialogOpen(false);
  };

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Attributes</Typography>
      <Button variant="contained" color="primary" onClick={() => setIsFormDialogOpen(true)} style={{ marginBottom: '20px' }}>
        Create Attribute
      </Button>
      <List>
        {attributes.map((attribute) => (
          <ListItem key={attribute.id} divider>
            <ListItemText
              primary={<Typography variant="h6" style={{ fontWeight: 'bold' }}>{attribute.name}</Typography>}
              secondary={
                <>
                  <Typography variant="body2">Description: {attribute.description}</Typography>
                </>
              }
            />
            <Button variant="contained" color="secondary" onClick={() => handleEditClick(attribute)} style={{ marginRight: '10px' }}>
              Edit
            </Button>
            <Button variant="contained" color="error" onClick={() => handleDeleteClick(attribute)}>
              Delete
            </Button>
          </ListItem>
        ))}
      </List>
      <AttributeForm
        attribute={selectedAttribute}
        onSuccess={selectedAttribute ? handleUpdateSuccess : handleCreateSuccess}
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
            Are you sure you want to delete this attribute?
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

export default Attributes;
