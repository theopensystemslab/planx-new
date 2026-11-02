import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import { useNavigate } from "@tanstack/react-router";
import { CloseButton } from "ui/shared/CloseButton";

import SubmissionDetailContent from "./SubmissionDetailContent";

interface SubmissionDetailModalProps {
  sessionId: string;
}

const SubmissionDetailModal: React.FC<SubmissionDetailModalProps> = ({
  sessionId,
}) => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate({
      search: undefined,
    });
  };

  return (
    <Dialog
      open
      onClose={handleClose}
      fullWidth
      maxWidth={false}
      slotProps={{
        paper: {
          sx: (theme) => ({ maxWidth: theme.breakpoints.values.lg }),
        },
      }}
    >
      <DialogTitle
        variant="h3"
        component="h2"
        sx={{ display: "flex", alignItems: "center" }}
      >
        Submission details
        <CloseButton onClick={handleClose} />
      </DialogTitle>

      <SubmissionDetailContent sessionId={sessionId} />
    </Dialog>
  );
};

export default SubmissionDetailModal;
