import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import React from "react";

const StyledListManagerHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
  position: "sticky",
  top: 0,
  backgroundColor: theme.palette.background.paper,
  zIndex: 1,
}));

interface ListManagerHeaderProps {
  disabled?: boolean;
  hasItems: boolean;
  allCollapsed: boolean;
  allExpanded: boolean;
  onCollapseAll: () => void;
  onExpandAll: () => void;
}

export const ListManagerHeader: React.FC<ListManagerHeaderProps> = ({
  disabled,
  hasItems,
  allCollapsed,
  allExpanded,
  onCollapseAll,
  onExpandAll,
}) => {
  return (
    <StyledListManagerHeader>
      <Button
        size="small"
        onClick={onCollapseAll}
        disabled={disabled || !hasItems || allCollapsed}
        sx={{ px: 1 }}
      >
        Collapse all
      </Button>
      <Button
        size="small"
        onClick={onExpandAll}
        disabled={disabled || !hasItems || allExpanded}
        sx={{ px: 1 }}
      >
        Expand all
      </Button>
    </StyledListManagerHeader>
  );
};
