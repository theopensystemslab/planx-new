import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Fab from "@mui/material/Fab";
import { styled } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

const StyledFab = styled(Fab)(() => ({
  position: "fixed",
  bottom: 20,
  left: 20,
  zIndex: 9999,
  backgroundColor: "#2c2c2c",
  color: "#fff",
  "&:hover": {
    backgroundColor: "#444",
  },
  textTransform: "none",
  fontFamily: "sans-serif",
  fontSize: "0.8125rem",
  gap: 6,
}));

/**
 * Renders an "Open in Editor" button when the current URL is a /draft preview.
 * On click, opens the corresponding node in the PlanX Editor in a new tab.
 */
const OpenInEditorButton: React.FC = () => {
  const getEditorURLForCurrentCard = useStore(
    (state) => state.getEditorURLForCurrentCard,
  );

  const isDraft = window.location.pathname.includes("/draft");
  if (!isDraft) return null;

  const handleClick = () => {
    try {
      const url = getEditorURLForCurrentCard();
      if (url) {
        window.open(url, "_blank");
      }
    } catch (error) {
      console.error("Failed to generate editor URL:", error);
    }
  };

  return (
    <Tooltip title="Open this node in the PlanX Editor" placement="right">
      <StyledFab
        variant="extended"
        size="small"
        onClick={handleClick}
        data-testid="open-in-editor-button"
      >
        <OpenInNewIcon fontSize="small" />
        Open in Editor
      </StyledFab>
    </Tooltip>
  );
};

export default OpenInEditorButton;
