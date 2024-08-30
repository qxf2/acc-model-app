import React from 'react';
import { Box, Button, Modal, TextField, Typography } from '@mui/material';

const AccModelForm = ({ isOpen, model, handleChange, handleSave, handleClose }) => {
  return (
    <Modal open={isOpen} onClose={handleClose}>
      <Box p={3} bgcolor="white" style={{ margin: 'auto', marginTop: '10%', maxWidth: '400px' }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {model.id ? 'Edit ACC Model' : 'Create New ACC Model'}
        </Typography>
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={model.name}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Description"
          name="description"
          value={model.description}
          onChange={handleChange}
          margin="normal"
        />
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            style={{ marginRight: '8px' }}
          >
            Save
          </Button>
          <Button variant="outlined" color="secondary" onClick={handleClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default AccModelForm;
