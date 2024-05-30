import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";

const TestEnvironmentBanner: React.FC = () => {
  const [isTestEnvBannerVisible, hideTestEnvBanner] = useStore((state) => [
    state.isTestEnvBannerVisible,
    state.hideTestEnvBanner,
  ]);

  const [isSnackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (isTestEnvBannerVisible) {
      setSnackbarOpen(true);
    }
  }, [isTestEnvBannerVisible]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    hideTestEnvBanner();
  };

  if (!isTestEnvBannerVisible) return null;

  return (
    <Snackbar
      open={isSnackbarOpen}
      autoHideDuration={null}
      onClose={handleCloseSnackbar}
      message="This is a testing environment for new features. Do
      not use it to make permanent content changes."
      sx={(theme) => ({ backgroundColor: theme.palette.info.main })}
      action={
        <Button
          sx={{ color: "white" }}
          size="small"
          onClick={handleCloseSnackbar}
        >
          Close
        </Button>
      }
    />
  );
};

export default TestEnvironmentBanner;
