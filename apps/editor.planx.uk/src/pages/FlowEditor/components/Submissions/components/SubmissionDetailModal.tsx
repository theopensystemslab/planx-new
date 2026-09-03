import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import { useNavigate } from "@tanstack/react-router";
import { CloseButton } from "ui/shared/CloseButton";

import { SubmissionDetailContent } from "./SubmissionDetailContent";

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
      slotProps={{
        paper: {
          sx: {
            width: { xs: "90%", md: "66.67%" },
            maxWidth: { xs: "90%", md: "66.67%" },
            margin: "auto",
          },
        },
      }}
      onClose={handleClose}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          marginX: 1,
        }}
      >
        <DialogTitle variant="h2">Submission details</DialogTitle>
        <CloseButton onClick={handleClose} sx={{ paddingTop: 2.5 }} />
      </Box>

      <SubmissionDetailContent sessionId={sessionId} />
    </Dialog>
  );
};

export default SubmissionDetailModal;
