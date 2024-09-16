import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextareaAutosize,
} from "@mui/material";

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
