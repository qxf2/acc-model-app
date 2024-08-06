import React, { useState, useEffect } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
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
        onSuccess(accModel ? { ...accModel, name, description } : { name, description });
      }
      onClose();
    } catch (error) {
      setError('Error saving ACC Model');
      console.error('Error saving ACC Model:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h5" gutterBottom>{accModel ? 'Edit ACC Model' : 'Create ACC Model'}</Typography>
      <form onSubmit={handleSubmit}>
        <div>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
        </div>
        <div>
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
        </div>
        {error && <Typography color="error">{error}</Typography>}
        <Button type="submit" variant="contained" color="primary">
          {accModel ? 'Update ACC Model' : 'Create ACC Model'}
        </Button>
      </form>
    </Container>
  );
}

export default ACCModelForm;
