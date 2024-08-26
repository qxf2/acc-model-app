import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TextField, Button, MenuItem, CircularProgress, Grid } from '@mui/material';

const CapabilityUpdateForm = ({ capabilityId, onSuccess, onClose }) => {
  const [capability, setCapability] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [comments, setComments] = useState('');
  const [rating, setRating] = useState('');
  const [componentId, setComponentId] = useState('');
  const [attributeId, setAttributeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [components, setComponents] = useState([]);
  const [attributes, setAttributes] = useState([]);

  useEffect(() => {
    fetchCapability();
    fetchComponents();
    fetchAttributes();
  }, [capabilityId]);

  const fetchCapability = async () => {
    try {
      const response = await axios.get(`/capabilities/${capabilityId}`);
      const capability = response.data;
      setCapability(capability);
      setName(capability.name);
      setDescription(capability.description);
      setComments(capability.comments);
      setRating(capability.rating);
      setComponentId(capability.component_id);
      setAttributeId(capability.attribute_id);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching capability:', error);
      setLoading(false);
    }
  };

  const fetchComponents = async () => {
    try {
      const response = await axios.get('/components');
      setComponents(response.data);
    } catch (error) {
      console.error('Error fetching components:', error);
    }
  };

  const fetchAttributes = async () => {
    try {
      const response = await axios.get('/attributes');
      setAttributes(response.data);
    } catch (error) {
      console.error('Error fetching attributes:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.put(`/capabilities/${capabilityId}`, {
        name,
        description,
        comments,
        rating,
        component_id: componentId,
        attribute_id: attributeId,
      });
      onSuccess();
    } catch (error) {
      console.error('Error updating capability:', error);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Rating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            fullWidth
            select
            required
          >
            <MenuItem value="Red">Red</MenuItem>
            <MenuItem value="Yellow">Yellow</MenuItem>
            <MenuItem value="Green">Green</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Component"
            value={componentId}
            onChange={(e) => setComponentId(e.target.value)}
            fullWidth
            select
            required
          >
            {components.map((component) => (
              <MenuItem key={component.id} value={component.id}>
                {component.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Attribute"
            value={attributeId}
            onChange={(e) => setAttributeId(e.target.value)}
            fullWidth
            select
            required
          >
            {attributes.map((attribute) => (
              <MenuItem key={attribute.id} value={attribute.id}>
                {attribute.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Update Capability
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default CapabilityUpdateForm;
