import PrintIcon from "@mui/icons-material/Print";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";

const StyledPrintButton = styled(Button)(() => ({
  "@media print": {
    display: "none",
  },
}));

const StyledTimestamp = styled(Typography)(() => ({
  display: "none",
  "@media print": {
    display: "block",
  },
}));

const PrintedAt = () => {
  return (
    <StyledTimestamp>
      Printed at {new Date().toLocaleString("en-GB")}.
    </StyledTimestamp>
  );
};

export const PrintButton = () => {
  return (
    <>
      <StyledPrintButton
        variant="contained"
        color="secondary"
        startIcon={<PrintIcon />}
        size="large"
        onClick={() => window.print()}
      >
        Print this page
      </StyledPrintButton>

      <PrintedAt />
    </>
  );
};
