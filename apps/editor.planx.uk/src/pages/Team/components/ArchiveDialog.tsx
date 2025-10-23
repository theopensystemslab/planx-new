import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import React from "react";

export const ArchiveDialog = ({
  title,
  content,
  submitLabel,
  open,
  handleClose,
  onConfirm,
}: {
  title: string;
  content: string;
  submitLabel: string;
  open: boolean;
  handleClose: () => void;
  onConfirm: () => void;
}) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle variant="h3" component="h1">
        {title}
      </DialogTitle>
      <DialogContent dividers>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          color="secondary"
          variant="contained"
          sx={{ backgroundColor: "background.default" }}
        >
          Cancel
        </Button>
        <Button onClick={onConfirm} color="warning" variant="contained">
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
