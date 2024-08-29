import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import { useToast } from "hooks/useToast";
import React from "react";

import { Toast as ToastProps } from "./types";

const Toast = ({ message, type = "success", id }: ToastProps) => {
  const toast = useToast();

  const handleCloseToast = () => {
    toast.remove(id);
  };

  return (
    <Snackbar onClose={handleCloseToast} autoHideDuration={6000} open={true}>
      <Alert onClose={handleCloseToast} severity={type} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
