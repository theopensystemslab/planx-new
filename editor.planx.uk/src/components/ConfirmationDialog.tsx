import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import React, { PropsWithChildren } from "react";

export interface ConfirmationDialogProps {
  open: boolean;
  onClose: (isConfirmed: boolean) => void;
  title: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmationDialog: React.FC<
  PropsWithChildren<ConfirmationDialogProps>
> = (props) => {
  const {
    onClose,
    open,
    children,
    title,
    confirmText = "Ok",
    cancelText = "Cancel ",
  } = props;

  const onCancel = () => onClose(false);
  const onConfirm = () => onClose(true);

  return (
    <Dialog
      data-testid="confirmation-dialog"
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: (theme) => theme.breakpoints.values.md,
          borderRadius: 0,
          background: "#FFF",
          margin: (theme) => theme.spacing(2),
        },
      }}
      maxWidth="xl"
      open={open}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{cancelText}</Button>
        <Button onClick={onConfirm}>{confirmText}</Button>
      </DialogActions>
    </Dialog>
  );
};
