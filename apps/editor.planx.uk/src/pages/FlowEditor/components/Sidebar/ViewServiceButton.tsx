import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import React from "react";
import { CustomLink } from "ui/shared/CustomLink/CustomLink";

export const viewServiceButtonStyles = (theme: Theme) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.5, 0.75),
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
  textDecoration: "none",
  border: `1px solid ${theme.palette.border.main}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  cursor: "pointer",
  transition: "background-color 0.15s ease",
  "&:hover": { backgroundColor: theme.palette.action.hover },
  "& svg": { fontSize: "1.15rem" },
});

export const ViewServiceButton = styled(CustomLink)(({ theme }) =>
  viewServiceButtonStyles(theme),
) as typeof CustomLink;

interface ViewServiceAnchorButtonProps {
  href?: string;
  target?: string;
  rel?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export const ViewServiceAnchorButton: React.FC<
  ViewServiceAnchorButtonProps
> = ({ href, target, rel, disabled, children }) => {
  const sx = (theme: Theme) => ({
    ...viewServiceButtonStyles(theme),
    ...(disabled && {
      color: theme.palette.text.disabled,
      opacity: 0.6,
      cursor: "default",
      "&:hover": {},
    }),
  });

  if (disabled || !href) {
    return <Box sx={sx}>{children}</Box>;
  }

  return (
    <Box component="a" href={href} target={target} rel={rel} sx={sx}>
      {children}
    </Box>
  );
};
