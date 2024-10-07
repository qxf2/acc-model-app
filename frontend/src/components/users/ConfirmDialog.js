import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";

/**
 * A dialog that asks the user to confirm that they want to delete a user.
 *
 * @param {bool} isOpen - Whether the dialog is open or not.
 * @param {function} handleClose - Called when the user clicks the cancel button.
 * @param {function} handleConfirm - Called when the user clicks the confirm button.
 * @returns {React.ReactElement} The ConfirmDialog component.
 */
const ConfirmDialog = ({ isOpen, handleClose, handleConfirm }) => {
  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this user?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="secondary">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
