import React from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";

const AttributeForm = ({
  isOpen,
  attribute,
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
          {attribute.id ? "Edit Attribute" : "Create New Attribute"}
        </Typography>
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={attribute.name}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Description"
          name="description"
          value={attribute.description}
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

export default AttributeForm;
