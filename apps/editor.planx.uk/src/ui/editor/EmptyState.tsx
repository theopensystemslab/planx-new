import Box, { BoxProps } from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";

type EmptyStateSize = "medium" | "small";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  size?: EmptyStateSize;
  sx?: BoxProps["sx"];
}

const Root = styled(Box, {
  shouldForwardProp: (prop) => prop !== "size",
})<{ size?: EmptyStateSize }>(({ theme, size }) => ({
  marginTop: theme.spacing(2),
  padding: size === "small" ? theme.spacing(1.5) : theme.spacing(2.5),
  border: `4px solid ${theme.palette.border.light}`,
  backgroundColor: theme.palette.background.default,
  display: "flex",
  flexDirection: "column",
  gap: size === "small" ? theme.spacing(0.5) : theme.spacing(1.5),
}));

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  size = "medium",
  sx,
}) => (
  <Root size={size} sx={sx}>
    {title && (
      <Typography variant={size === "small" ? "h4" : "h3"}>{title}</Typography>
    )}
    {description && (
      <Typography variant={size === "small" ? "body2" : "body1"}>
        {description}
      </Typography>
    )}
    {action}
  </Root>
);
