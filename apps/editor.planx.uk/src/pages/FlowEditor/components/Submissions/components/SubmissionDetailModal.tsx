import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import React from "react";

import { DownloadSubmissionButton } from "./DownloadSubmissionButton";
import { OpenResponseButton } from "./OpenResponseButton";
import { ViewSubmissionButton } from "./ViewSubmissionButton";

interface RowModalProps {
  sessionId: string;
  open: boolean;
  handleClose: () => void;
}

const SubmissionDetailModal: React.FC<RowModalProps> = ({
  sessionId,
  open,
  handleClose,
}) => {
  // hook to get session ID submission and pay history

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle variant="h3" component="h1">
        Submission details
      </DialogTitle>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <DialogContent>Details</DialogContent>
        <DialogContent>History</DialogContent>
      </Box>
      <DialogActions>
        <Button
          onClick={handleClose}
          color="secondary"
          variant="contained"
          sx={{ backgroundColor: "background.default" }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubmissionDetailModal;
