import PrintIcon from "@mui/icons-material/Print";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

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

const PrintedAt = ({
  showSubmissionDisclaimer,
}: {
  showSubmissionDisclaimer: boolean;
}) => {
  return (
    <StyledTimestamp>
      Printed at {new Date().toLocaleString("en-GB")}.
      {showSubmissionDisclaimer &&
        " This is a record of your responses so far and does not confirm submission."}
    </StyledTimestamp>
  );
};

export const PrintButton = ({
  showSubmissionDisclaimer = true,
}: {
  showSubmissionDisclaimer?: boolean;
}) => {
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

      <PrintedAt showSubmissionDisclaimer={showSubmissionDisclaimer} />
    </>
  );
};
