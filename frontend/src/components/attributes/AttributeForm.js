import React from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";

/**
 * A React component for creating or editing an attribute through a form.
 *
 * @param {bool} isOpen - Whether the form should be shown or not.
 * @param {Object} attribute - The attribute to be edited, or an empty object
 *   if a new attribute is being created.
 * @param {function} handleChange - A function to be called when the user
 *   changes the value of one of the form fields.
 * @param {function} handleSave - A function to be called when the user clicks
 *   the "Save" button.
 * @param {function} handleClose - A function to be called when the user clicks
 *   the "Cancel" button.
 * @param {string} errorMessage - An error message to be shown to the user,
 *   or an empty string if no error message should be shown.
 */
const AttributeForm = ({
  isOpen,
  attribute,
  handleChange,
  handleSave,
  handleClose,
  errorMessage,
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
