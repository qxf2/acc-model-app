import React, { useState, useEffect } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import api from '../services/api';

function ComponentForm({ component, onSuccess, open, onClose, accModelId }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [accModelName, setAccModelName] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      if (component) {
        setName(component.name);
        setDescription(component.description);
      } else {
        resetForm();
      }
      setError(null); // Reset error state when the dialog is opened
    } else {
      resetForm();
    }

    if (accModelId) {
      fetchAccModelName(accModelId);
    }
  }, [component, open, accModelId]);

  const resetForm = () => {
    setName('');
    setDescription('');
  };

  const fetchAccModelName = async (id) => {
    try {
      const response = await api.get(`/acc-models/${id}`);
      setAccModelName(response.data.name);
    } catch (error) {
      setError('Error fetching ACC Model name');
      console.error('Error fetching ACC Model name:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (component) {
        await api.put(`/components/id/${component.id}`, { name, description, acc_model_id: accModelId });
      } else {
        await api.post('/components', { name, description, acc_model_id: accModelId });
      }
      setError(null);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError('Component with this name already exists');
      } else {
        setError('Error saving component');
      }
      console.error('Error saving component:', error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
      <DialogTitle>{component ? 'Edit Component' : 'Create Component'}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="ACC Model"
            value={accModelName}
            disabled
            fullWidth
            margin="normal"
          />
          {error && <Typography color="error">{error}</Typography>}
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          {component ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ComponentForm;
