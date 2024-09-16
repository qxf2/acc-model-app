import React from "react";
import { Box, Button, Modal, TextField, Typography } from "@mui/material";

const ComponentForm = ({
  isOpen,
  component,
  handleChange,
  handleSave,
  handleClose,
}) => {
  return (
    <Modal open={isOpen} onClose={handleClose}>
      <Box
        p={3}
        bgcolor="white"
        style={{ margin: "auto", marginTop: "10%", maxWidth: "400px" }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          {component.id ? "Edit Component" : "Create New Component"}
        </Typography>
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={component.name}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Description"
          name="description"
          value={component.description}
          onChange={handleChange}
          margin="normal"
        />
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            style={{ marginRight: "8px" }}
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

export default ComponentForm;
