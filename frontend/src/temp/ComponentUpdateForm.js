import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import axios from 'axios';

const CapabilityUpdateForm = ({ capabilityId, onSuccess, open, onClose }) => {
  const [capability, setCapability] = useState({ name: '', description: '', component_id: '', attribute_id: '' });
  const [components, setComponents] = useState([]);
  const [attributes, setAttributes] = useState([]);

  useEffect(() => {
    if (capabilityId && open) {
      fetchCapability(capabilityId);
    }
  }, [capabilityId, open]);

  const fetchCapability = async (id) => {
    try {
      const response = await axios.get(`/capabilities/${id}`);
      setCapability(response.data);
    } catch (error) {
      console.error('Error fetching capability:', error);
    }
  };

  useEffect(() => {
    fetchComponentsAndAttributes();
  }, []);

  const fetchComponentsAndAttributes = async () => {
    try {
      const componentsResponse = await axios.get('/components');
      setComponents(componentsResponse.data);
      const attributesResponse = await axios.get('/attributes');
      setAttributes(attributesResponse.data);
    } catch (error) {
      console.error('Error fetching components or attributes:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.put(`/capabilities/${capabilityId}`, capability);
      onSuccess();
    } catch (error) {
      console.error('Error updating capability:', error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCapability((prevCapability) => ({
      ...prevCapability,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Capability Name"
            variant="outlined"
            fullWidth
            name="name"
            id="capability-name"
            value={capability.name}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Description"
            variant="outlined"
            fullWidth
            name="description"
            id="capability-description"
            value={capability.description}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel id="component-label">Component</InputLabel>
            <Select
              labelId="component-label"
              id="component-select"
              value={capability.component_id || ''}
              onChange={handleChange}
              label="Component"
              name="component_id"
              required
            >
              {components.map((component) => (
                <MenuItem key={component.id} value={component.id}>
                  {component.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel id="attribute-label">Attribute</InputLabel>
            <Select
              labelId="attribute-label"
              id="attribute-select"
              value={capability.attribute_id || ''}
              onChange={handleChange}
              label="Attribute"
              name="attribute_id"
              required
            >
              {attributes.map((attribute) => (
                <MenuItem key={attribute.id} value={attribute.id}>
                  {attribute.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Button type="submit" variant="contained" color="primary" style={{ marginTop: '20px' }}>
        Update Capability
      </Button>
    </form>
  );
};

export default CapabilityUpdateForm;
