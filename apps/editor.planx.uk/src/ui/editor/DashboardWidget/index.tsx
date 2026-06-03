import Box from "@mui/material/Box";
import { styled, SxProps, Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { LinkOptions, RegisteredRouter } from "@tanstack/react-router";
import { BadgeChip } from "components/EditorNavMenu/styles";
import React from "react";
import { CustomLink } from "ui/shared/CustomLink/CustomLink";

interface DashboardWidgetProps {
  title: string;
  count?: number;
  link?: LinkOptions<RegisteredRouter> & { label: string };
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

const Root = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.border.light}`,
  display: "flex",
  flexDirection: "column",
  height: "380px",
  zIndex: 1,
}));

const Header = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "baseline",
  justifyContent: "space-between",
  padding: theme.spacing(1.5),
}));

const StyledWidgetLink = styled(CustomLink)(({ theme }) => ({
  fontSize: theme.typography.body3.fontSize,
  color: theme.palette.text.secondary,
  "&:hover": {
    textDecorationThickness: "2px",
  },
})) as typeof CustomLink;

type WidgetLinkProps = LinkOptions<RegisteredRouter> & { label: string };

export const WidgetLink = ({ label, ...linkProps }: WidgetLinkProps) => (
  <StyledWidgetLink
    {...(linkProps as React.ComponentProps<typeof StyledWidgetLink>)}
  >
    {label}
  </StyledWidgetLink>
);

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  count,
  link,
  children,
  sx,
}) => (
  <Root sx={sx}>
    <Header>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="h3" component="h2">
          {title}
        </Typography>
        {count !== undefined && count > 0 && (
          <BadgeChip label={count} color="info" />
        )}
      </Box>
      {link && <WidgetLink {...link} />}
    </Header>
    {children}
  </Root>
);
