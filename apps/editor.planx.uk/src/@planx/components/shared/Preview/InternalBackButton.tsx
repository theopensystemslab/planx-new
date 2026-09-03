import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { BackButton } from "pages/Preview/Questions";
import React from "react";

/**
 * A presentation-only back button for in-component navigation
 *
 * Mimics the global `BackButton` UI but accepts a `handleBack` prop
 * to control local component state (steps) rather than node-by-node navigation
 */
const InternalBackButton: React.FC<{ handleBack: () => void }> = ({
  handleBack,
}) => (
  <Box
    sx={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      zIndex: "2000",
    }}
  >
    <Container maxWidth="contentWrap">
      <BackButton onClick={handleBack} hidden={false} variant="link">
        <ArrowBackIcon fontSize="small" />
        Back
      </BackButton>
    </Container>
  </Box>
);

export default InternalBackButton;
