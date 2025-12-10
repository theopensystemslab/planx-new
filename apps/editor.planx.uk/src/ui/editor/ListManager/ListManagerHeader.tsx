import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import React from "react";

const StyledListManagerHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
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
        variant="link"
        onClick={onCollapseAll}
        disabled={disabled || !hasItems || allCollapsed}
        sx={{ p: 0 }}
      >
        Collapse all
      </Button>
      <Button
        size="small"
        variant="link"
        onClick={onExpandAll}
        disabled={disabled || !hasItems || allExpanded}
        sx={{ p: 0 }}
      >
        Expand all
      </Button>
    </StyledListManagerHeader>
  );
};
