import React from "react";
import { Box, Button, Modal, TextField, Typography } from "@mui/material";

/**
 * A React component for creating or editing a capability through a form.
 *
 * @param {bool} isOpen - Whether the form should be shown or not.
 * @param {function} onClose - A function to be called when the user clicks
 *   the "Cancel" button.
 * @param {Object} capability - The capability to be edited, or an empty object
 *   if a new capability is being created.
 * @param {function} onChange - A function to be called when the user changes
 *   the value of one of the form fields.
 * @param {function} onSave - A function to be called when the user clicks
 *   the "Save" button.
 * @param {string} errorMessage - An error message to be shown to the user,
 *   or an empty string if no error message should be shown.
 */
const CapabilityForm = ({ isOpen, onClose, capability, onChange, onSave, errorMessage }) => {
  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        p={3}
        bgcolor="white"
        style={{ margin: "auto", marginTop: "10%", maxWidth: "400px" }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          {capability.id ? "Edit Capability" : "Create New Capability"}
        </Typography>
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={capability.name}
          onChange={onChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Description"
          name="description"
          value={capability.description}
          onChange={onChange}
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
            onClick={onSave}
            style={{ marginRight: "8px" }}
          >
            Save
          </Button>
          <Button variant="outlined" color="secondary" onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CapabilityForm;
