import React, { useState, useEffect } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import api from '../services/api';

function AttributeForm({ attribute, onSuccess, open, onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      if (attribute) {
        setName(attribute.name);
        setDescription(attribute.description);
      } else {
        resetForm();
      }
      setError(null); // Reset error state when the dialog is opened
    } else {
      resetForm();
    }
  }, [attribute, open]);

  const resetForm = () => {
    setName('');
    setDescription('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (attribute) {
        await api.put(`/attributes/${attribute.id}`, { name, description });
      } else {
        await api.post('/attributes', { name, description });
      }
      setError(null);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError('Attribute with this name already exists');
      } else {
        setError('Error saving attribute');
      }
      console.error('Error saving attribute:', error);
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
      <DialogTitle>{attribute ? 'Edit Attribute' : 'Create Attribute'}</DialogTitle>
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
          {error && <Typography color="error">{error}</Typography>}
          <DialogActions>
            <Button onClick={() => { resetForm(); onClose(); }} color="primary">Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {attribute ? 'Update Attribute' : 'Create Attribute'}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AttributeForm;
