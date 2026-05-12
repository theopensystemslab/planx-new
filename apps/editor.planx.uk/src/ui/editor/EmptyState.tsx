import Box, { BoxProps } from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  compact?: boolean;
  sx?: BoxProps["sx"];
}

const Root = styled(Box, {
  shouldForwardProp: (prop) => prop !== "compact",
})<{ compact?: boolean }>(({ theme, compact }) => ({
  marginTop: theme.spacing(2),
  padding: compact ? theme.spacing(1.5) : theme.spacing(2.5),
  border: `4px solid ${theme.palette.border.light}`,
  backgroundColor: theme.palette.background.default,
  display: "flex",
  flexDirection: "column",
  gap: compact ? theme.spacing(0.5) : theme.spacing(1.5),
}));

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  compact = false,
  sx,
}) => (
  <Root compact={compact} sx={sx}>
    {title && <Typography variant={compact ? "h4" : "h3"}>{title}</Typography>}
    {description && (
      <Typography variant={compact ? "body2" : "body1"}>
        {description}
      </Typography>
    )}
    {action}
  </Root>
);
