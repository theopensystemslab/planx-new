import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";

type EmptyStateSize = "medium" | "small";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  size?: EmptyStateSize;
  sx?: BoxProps["sx"];
}

const Root = styled(Box, {
  shouldForwardProp: (prop) => prop !== "size",
})<{ size?: EmptyStateSize }>(({ theme, size }) => ({
  position: "relative",
  marginTop: theme.spacing(2),
  padding:
    size === "small"
      ? theme.spacing(1.5, 1.5, 1.75)
      : theme.spacing(2.5, 2.5, 2.75),
  border: `2px solid ${theme.palette.border.light}`,
  backgroundColor: theme.palette.background.default,
  display: "flex",
  flexDirection: "column",
  gap: size === "small" ? theme.spacing(0.75) : theme.spacing(1.5),
  textAlign: "center",
}));

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon,
  size = "medium",
  sx,
}) => (
  <Root size={size} sx={sx}>
    {icon && (
      <Box
        sx={(theme) => ({
          display: "flex",
          justifyContent: "center",
          "& svg": { fontSize: "3rem", color: theme.palette.text.secondary },
        })}
      >
        {icon}
      </Box>
    )}
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
