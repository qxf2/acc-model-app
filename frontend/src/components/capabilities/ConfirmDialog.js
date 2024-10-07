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
 * A dialog that asks the user to confirm that they want to delete a capability.
 *
 * @param {{isOpen: boolean, onClose: function, onConfirm: function}} props
 * @prop {boolean} isOpen - Whether the dialog is open or not.
 * @prop {function} onClose - Called when the user clicks the cancel button.
 * @prop {function} onConfirm - Called when the user clicks the confirm button.
 * @returns {React.ReactElement} The ConfirmDialog component.
 */
const ConfirmDialog = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this capability? This action cannot be
          undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="secondary">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
