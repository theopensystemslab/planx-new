import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { useToast } from "hooks/useToast";
import React from "react";

import { Toast as ToastProps } from "./types";

const Toast = ({ message, type = "success", id }: ToastProps) => {
  const toast = useToast();

  const handleCloseToast = () => {
    if (toast) {
      toast.remove(id);
    } else {
      console.warn("ToastContext is not provided.");
    }
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      autoHideDuration={6000}
      onClose={handleCloseToast}
      open={true}
    >
      <Alert
        onClose={handleCloseToast}
        severity={type}
        sx={(theme) => ({
          width: "100%",
          alignItems: "center",
          border: "2px solid currentColor",
          fontSize: "1rem",
          padding: theme.spacing(1, 2),
          "& .MuiAlert-icon": {
            fontSize: "1.5rem",
          },
          "& .MuiAlert-action": {
            paddingTop: 0,
          },
        })}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
