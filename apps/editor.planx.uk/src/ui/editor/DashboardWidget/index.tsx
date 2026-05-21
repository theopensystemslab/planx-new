import Box from "@mui/material/Box";
import { styled, SxProps, Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";
import { CustomLink } from "ui/shared/CustomLink/CustomLink";

interface DashboardWidgetProps {
  title: string;
  linkTarget?: string;
  linkText?: string;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

const Root = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.border.light}`,
  padding: theme.spacing(1.5),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  height: "400px",
}));

const Header = styled(Box)({
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
});

export const WidgetLink = styled(CustomLink)(({ theme }) => ({
  fontSize: theme.typography.body3.fontSize,
  color: theme.palette.text.secondary,
  "&:hover": {
    textDecorationThickness: "2px",
  },
})) as typeof CustomLink;

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  linkTarget,
  linkText,
  children,
  sx,
}) => (
  <Root sx={sx}>
    <Header>
      <Typography variant="h3" component="h2">
        {title}
      </Typography>
      {linkTarget && linkText && (
        <WidgetLink to={linkTarget}>{linkText}</WidgetLink>
      )}
    </Header>
    {children}
  </Root>
);
