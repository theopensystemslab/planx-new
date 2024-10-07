import PrintIcon from "@mui/icons-material/Print";
import Button from "@mui/material/Button";
import React from "react";

export const PrintButton = () => {
  return (
    <Button
      variant="contained"
      color="secondary"
      startIcon={<PrintIcon />}
      size="large"
      onClick={() => window.print()}
    >
      Print this page
    </Button>
  );
};
