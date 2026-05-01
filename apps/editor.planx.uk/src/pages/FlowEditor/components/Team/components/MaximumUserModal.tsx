import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import React from "react";

import { AddUserModalProps } from "../types";

export const MaximumUserModal: React.FC<AddUserModalProps> = ({ onClose }) => {
  return (
    <Dialog
      aria-labelledby="dialog-heading"
      data-testid="dialog-maximum-users"
      open
      onClose={onClose}
    >
      <DialogTitle variant="h3" component="h1" id="dialog-heading">
        Maximum users reached
      </DialogTitle>
      <DialogContent>
        <Typography>
          The maximum number of users already exists for this team. To add
          another member, please remove an existing one or contact an admin.
        </Typography>
      </DialogContent>
    </Dialog>
  );
};
