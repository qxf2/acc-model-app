import React from 'react';
import { Box, Button, Card, CardContent, Grid, Typography } from '@mui/material';

const CapabilityList = ({ components, capabilities, onEdit, onDelete, onCreate }) => {
  return (
    <>
      {components.map((component) => (
        <Box key={component.id} mb={4}>
          <Typography variant="h6" style={{ color: '#3f51b5' }} gutterBottom>
            {component.name}
          </Typography>
          <Box display="flex" justifyContent="flex-end" mb={2}>
            <Button variant="contained" color="primary" onClick={() => onCreate(component.id)}>
              Create New Capability
            </Button>
          </Box>
          <Grid container spacing={2}>
            {capabilities[component.id] &&
              capabilities[component.id].map((capability) => (
                <Grid item xs={12} key={capability.id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="h6">{capability.name}</Typography>
                          <Typography color="textSecondary">{capability.description}</Typography>
                        </Box>
                        <Box>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => onEdit(component.id, capability)}
                            style={{ marginRight: '8px' }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            onClick={() => onDelete(capability.id, component.id)}
                          >
                            Delete
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Box>
      ))}
    </>
  );
};

export default CapabilityList;
