import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextareaAutosize,
} from "@mui/material";

/**
 * A dialog for adding a comment to a rating.
 * @param {bool} open - Whether the dialog is open or not.
 * @param {string} currentComment - The current comment being edited.
 * @param {function} handleCommentChange - Called when the user changes the comment.
 * @param {function} handleSubmitComment - Called when the user clicks the save button.
 * @param {function} handleCloseModal - Called when the user clicks the cancel button.
 * @returns {React.ReactElement} The CommentDialog component.
 */
const CommentDialog = ({
  open,
  currentComment,
  handleCommentChange,
  handleSubmitComment,
  handleCloseModal,
}) => (
  <Dialog open={open} onClose={handleCloseModal}>
    <DialogTitle>Add Comment</DialogTitle>
    <DialogContent>
      <TextareaAutosize
        minRows={4}
        placeholder="Enter your comments here"
        value={currentComment}
        onChange={handleCommentChange}
        style={{ width: "100%" }}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={handleCloseModal} color="primary">
        Cancel
      </Button>
      <Button onClick={handleSubmitComment} color="primary">
        Save
      </Button>
    </DialogActions>
  </Dialog>
);

export default CommentDialog;
