import Close from "@mui/icons-material/CloseOutlined";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { ReactNode } from "react";

interface DataTableModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
}

const CloseButton = styled(IconButton)(({ theme }) => ({
  margin: "0 0 0 auto",
  padding: theme.spacing(1),
  color: theme.palette.grey[600],
}));

const ModalHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: `1px solid ${theme.palette.border.main}`,
}));

const ModalBody = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  overflow: "auto",
}));

export const DataTableModal: React.FC<DataTableModalProps> = ({
  open,
  onClose,
  title,
  children,
}) => {
  return (
    <Dialog open={open} fullWidth onClose={onClose}>
      <ModalHeader>
        <Typography variant="h4">{title}</Typography>
        <CloseButton aria-label="close" onClick={onClose} size="large">
          <Close />
        </CloseButton>
      </ModalHeader>
      <ModalBody>{children}</ModalBody>
    </Dialog>
  );
};
