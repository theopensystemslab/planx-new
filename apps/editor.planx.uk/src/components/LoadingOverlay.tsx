import Alert, { alertClasses } from "@mui/material/Alert";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Portal from "@mui/material/Portal";
import { useRouter } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useRef, useState } from "react";

interface LoadingOverlayProps {
  msDelayBeforeVisible?: number;
  msMinimumDisplayTime?: number;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  msDelayBeforeVisible = 300,
  msMinimumDisplayTime = 900,
}) => {
  const isLoading = useRouter().state.isLoading;
  const loadingMessage = useStore((state) => state.loadingMessage);
  const onLoadingComplete = useStore((state) => state.onLoadingComplete);

  const [shouldShow, setShouldShow] = useState(false);
  const showingSinceRef = useRef<number | null>(null);

  useEffect(() => {
    if (isLoading) {
      setShouldShow(true);
      showingSinceRef.current = Date.now();
    } else if (showingSinceRef.current !== null) {
      const elapsedTime = Date.now() - showingSinceRef.current;
      const remainingTime = Math.max(0, msMinimumDisplayTime - elapsedTime);

      const timer = setTimeout(() => {
        setShouldShow(false);
        showingSinceRef.current = null;
        setTimeout(() => {
          onLoadingComplete?.();
        }, 100);
      }, remainingTime);

      return () => clearTimeout(timer);
    }
  }, [isLoading, msMinimumDisplayTime, onLoadingComplete]);

  return (
    <Portal>
      <Backdrop
        sx={(theme) => ({
          zIndex: theme.zIndex.modal + 1,
          alignItems: "flex-start",
          paddingTop: theme.spacing(2),
        })}
        open={shouldShow}
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
