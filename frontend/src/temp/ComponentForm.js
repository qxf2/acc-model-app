import React, { useState } from 'react';
import { Button, TextField, DialogActions } from '@mui/material';
import api from '../services/api';

function ComponentForm({ onSuccess, onClose, accModelId }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.post('/components', {
        name,
        description,
        acc_model_id: accModelId,
      });
      setError(null);
      if (onSuccess) {
        onSuccess(response.data);
      }
      onClose(); // Ensure the dialog closes on success
    } catch (error) {
      setError('Error creating component');
      console.error('Error creating component:', error);
    }
  };

  return (
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
        required
        fullWidth
        margin="normal"
      />
      {error && <div>{error}</div>}
      <DialogActions>
        <Button onClick={onClose} color="primary">Cancel</Button>
        <Button type="submit" variant="contained" color="primary">
          Create Component
        </Button>
      </DialogActions>
    </form>
  );
}

export default ComponentForm;
