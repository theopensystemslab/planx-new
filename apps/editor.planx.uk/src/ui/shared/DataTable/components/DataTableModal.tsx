import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import React from "react";
import { CloseButton } from "ui/shared/CloseButton";

interface DataTableModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
}

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
        <CloseButton onClick={onClose} />
      </ModalHeader>
      <ModalBody>{children}</ModalBody>
    </Dialog>
  );
};
