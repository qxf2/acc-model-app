import React from "react";
import { Box, Button, Modal, TextField, Typography } from "@mui/material";

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
