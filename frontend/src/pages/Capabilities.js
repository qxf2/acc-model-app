// CapabilitiesPage.js
import React, { useEffect, useState } from 'react';
import api from './api';
import { Container, Typography, List, ListItem, ListItemText } from '@mui/material';

const CapabilitiesPage = () => {
  const [capabilities, setCapabilities] = useState([]);

  useEffect(() => {
    const fetchCapabilities = async () => {
      try {
        const response = await api.get('/capabilities');
        setCapabilities(response.data);
      } catch (error) {
        console.error('Error fetching capabilities:', error);
      }
    };
    fetchCapabilities();
  }, []);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Capabilities</Typography>
      <List>
        {capabilities.map((capability) => (
          <ListItem key={capability.id}>
            <ListItemText primary={capability.name} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default CapabilitiesPage;
