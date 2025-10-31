import Alert, { alertClasses } from "@mui/material/Alert";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Portal from "@mui/material/Portal";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

interface LoadingOverlayProps {
  msDelayBeforeVisible?: number;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  msDelayBeforeVisible = 300,
}) => {
  const isLoading = useStore((state) => state.isLoading);
  const loadingMessage = useStore((state) => state.loadingMessage);

  return (
    <Portal>
      <Backdrop
        sx={(theme) => ({
          zIndex: theme.zIndex.modal + 1,
          alignItems: "flex-start",
          paddingTop: theme.spacing(2),
        })}
        open={isLoading}
        transitionDuration={300}
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
              text={loadingMessage}
              msDelayBeforeVisible={msDelayBeforeVisible}
              variant="spinner"
            />
          </Alert>
        </Box>
      </Backdrop>
    </Portal>
  );
};

export default LoadingOverlay;
