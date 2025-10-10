import Alert, { alertClasses } from "@mui/material/Alert";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import React from "react";

interface LoadingOverlayProps {
  open: boolean;
  message?: string;
  msDelayBeforeVisible?: number;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  open,
  message = "Loading...",
  msDelayBeforeVisible = 300,
}) => {
  return (
    <Backdrop
      sx={(theme) => ({
        zIndex: theme.zIndex.modal + 1,
        alignItems: "flex-start",
        paddingTop: theme.spacing(2),
      })}
      open={open}
    >
      <Box>
        <Alert
          severity="info"
          sx={(theme) => ({
            fontSize: "1rem",
            padding: theme.spacing(1, 2),
            borderRadius: "4px",
            [`& .${alertClasses.icon}`]: {
              display: "none",
            },
            [`& .${alertClasses.message}`]: {
              display: "flex",
              alignItems: "center",
              gap: theme.spacing(2),
              overflow: "hidden",
            },
          })}
        >
          <DelayedLoadingIndicator
            inline
            text={message}
            msDelayBeforeVisible={msDelayBeforeVisible}
            variant="spinner"
          />
        </Alert>
      </Box>
    </Backdrop>
  );
};

export default LoadingOverlay;
