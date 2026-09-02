import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import React from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export const InitiateRefundDialog = ({ open, onClose }: Props) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle variant="h3" component="h1">
        Initiate refund
      </DialogTitle>
      <DialogContent dividers>
        <DialogContentText>
          Refunds are managed centrally by the PlanX team. To refund this
          payment, please contact the team.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
