import React from 'react';
import { Box, Button, Modal, TextField, Typography } from '@mui/material';

/**
 * A React component for creating or editing an ACC model through a form.
 *
 * @param {bool} isOpen - Whether the form should be shown or not.
 * @param {Object} model - The ACC model to be edited, or an empty object
 *   if a new ACC model is being created.
 * @param {function} handleChange - A function to be called when the user
 *   changes the value of one of the form fields.
 * @param {function} handleSave - A function to be called when the user clicks
 *   the "Save" button.
 * @param {function} handleClose - A function to be called when the user clicks
 *   the "Cancel" button.
 * @param {string} errorMessage - An error message to be shown to the user,
 *   or an empty string if no error message should be shown.
 */
const AccModelForm = ({ isOpen, model, handleChange, handleSave, handleClose, errorMessage }) => {
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
        {errorMessage && (
          <Typography color="error" style={{ marginTop: '10px' }}>
            {errorMessage}
          </Typography>
        )}
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
