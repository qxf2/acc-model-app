import React, { useState, useEffect } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import api from '../services/api';

function ACCModelForm({ accModel, onSuccess, open, onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open) {
      if (accModel) {
        setName(accModel.name);
        setDescription(accModel.description);
      } else {
        resetForm();
      }
      setError(null); // Reset error state when the dialog is opened
    } else {
      resetForm();
    }
  }, [accModel, open]);

  const resetForm = () => {
    setName('');
    setDescription('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (accModel) {
        await api.put(`/acc-models/${accModel.id}`, { name, description });
      } else {
        await api.post('/acc-models', { name, description });
      }
      setError(null);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError('ACC Model with this name already exists');
      } else {
        setError('Error saving ACC model');
      }
      console.error('Error saving ACC model:', error);
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
      <DialogTitle>{accModel ? 'Edit ACC Model' : 'Create ACC Model'}</DialogTitle>
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
              {accModel ? 'Update ACC Model' : 'Create ACC Model'}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ACCModelForm;
