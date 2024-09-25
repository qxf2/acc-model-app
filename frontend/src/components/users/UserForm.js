import React, { useState } from "react";
import { Box, Button, Modal, TextField, Typography } from "@mui/material";

const UserForm = ({ isOpen, user, handleChange, handleSave, handleClose, errorMessage }) => {

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <Box
        p={3}
        bgcolor="white"
        style={{ margin: "auto", marginTop: "10%", maxWidth: "400px" }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          {user.id ? "Edit User" : "Create New User"}
        </Typography>
        <TextField
          fullWidth
          label="Username"
          name="username"
          value={user.username}
          onChange={handleChange}
          margin="normal"
          placeholder="Username should be min 3 characters"
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          value={user.email}
          onChange={handleChange}
          margin="normal"
          placeholder="Email should be min 3 characters"
        />
        <TextField
          fullWidth
          label="Password"
          name="password"
          type="password"
          value={user.password}
          onChange={handleChange}
          margin="normal"
          placeholder="Password must be atleast 6 characters long"
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

export default UserForm;
