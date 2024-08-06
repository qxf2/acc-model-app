import React, { useState, useEffect } from 'react';
import { Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Typography } from '@mui/material';
import api from '../services/api';

function CapabilityForm({ capability, onSuccess, open, onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [componentId, setComponentId] = useState('');
  const [attributeId, setAttributeId] = useState('');
  const [components, setComponents] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [error, setError] = useState(null);

  const fetchComponentsAndAttributes = async () => {
    try {
      const [componentsResponse, attributesResponse] = await Promise.all([
        api.get('/components'),
        api.get('/attributes')
      ]);
      setComponents(componentsResponse.data);
      setAttributes(attributesResponse.data);
    } catch (error) {
      setError('Error fetching components and attributes');
      console.error('Error fetching components and attributes:', error);
    }
  };

  useEffect(() => {
    fetchComponentsAndAttributes();
  }, []);

  useEffect(() => {
    if (open) {
      setName(capability ? capability.name : '');
      setDescription(capability ? capability.description : '');
      setComponentId(capability ? capability.component_id : '');
      setAttributeId(capability ? capability.attribute_id : '');
    }
  }, [open, capability, components, attributes]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (capability) {
        await api.put(`/capabilities/${capability.id}`, { name, description, component_id: componentId, attribute_id: attributeId });
      } else {
        await api.post('/capabilities', { name, description, component_id: componentId, attribute_id: attributeId });
      }
      setError(null);
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      setError('Error saving capability');
      console.error('Error saving capability:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{capability ? 'Edit Capability' : 'Create Capability'}</DialogTitle>
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
            label="Component"
            value={componentId}
            onChange={(e) => setComponentId(e.target.value)}
            select
            required
            fullWidth
            margin="normal"
          >
            {components.map((component) => (
              <MenuItem key={component.id} value={component.id}>
                {component.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Attribute"
            value={attributeId}
            onChange={(e) => setAttributeId(e.target.value)}
            select
            required
            fullWidth
            margin="normal"
          >
            {attributes.map((attribute) => (
              <MenuItem key={attribute.id} value={attribute.id}>
                {attribute.name}
              </MenuItem>
            ))}
          </TextField>
          {error && <Typography color="error">{error}</Typography>}
          <DialogActions>
            <Button onClick={onClose} color="primary">Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {capability ? 'Update Capability' : 'Create Capability'}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CapabilityForm;
