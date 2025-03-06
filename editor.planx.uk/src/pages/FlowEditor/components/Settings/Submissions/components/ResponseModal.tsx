import Close from "@mui/icons-material/CloseOutlined";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";

import { FormattedResponse } from "./FormattedResponse";

interface ResponseModalProps {
  open: boolean;
  onClose: () => void;
  response: Record<string, any> | null;
}

const CloseButton = styled(IconButton)(({ theme }) => ({
  margin: "0 0 0 auto",
  padding: theme.spacing(1),
  color: theme.palette.grey[600],
}));

export const ResponseModal: React.FC<ResponseModalProps> = ({
  open,
  onClose,
  response,
}) => {
  return (
    <Dialog open={open} fullWidth maxWidth="md" onClose={onClose}>
      <Box
        sx={{
          padding: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4">JSON Response</Typography>
        <CloseButton aria-label="close" onClick={onClose} size="large">
          <Close />
        </CloseButton>
      </Box>
      {response ? (
        <FormattedResponse response={response} />
      ) : (
        <CircularProgress />
      )}
    </Dialog>
  );
};
