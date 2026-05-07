import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import EnvironmentSelect from "components/EditorNavMenu/components/EnvironmentSelect";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { CustomLink } from "ui/shared/CustomLink/CustomLink";

const HeaderRoot = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(1, 0.85),
  borderBottom: `1px solid ${theme.palette.divider}`,
  borderRight: `1px solid ${theme.palette.divider}`,
  marginTop: theme.spacing(0.25),
  width: "100%",
  minHeight: 48,
}));

const LogoLink = styled(CustomLink)(({ theme }) => ({
  color: theme.palette.text.primary,
  textDecoration: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.5, 0.75),
  lineHeight: 0.5,
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
}));

const LogoIcon = styled(Box)(({ theme }) => ({
  width: 16,
  height: 16,
  backgroundColor: theme.palette.primary.main,
  borderRadius: "50%",
}));

export interface NavMenuHeaderProps {
  compact?: boolean;
}

const NavMenuHeader: React.FC<NavMenuHeaderProps> = ({ compact = false }) => {
  const isStandalone = useStore(
    (state) => state.previewEnvironment === "standalone",
  );

  return (
    <HeaderRoot>
      <LogoLink
        to="/"
        preload={false}
        {...(isStandalone && { target: "_blank" })}
        variant="subtitle2"
      >
        <LogoIcon />
        {compact ? "" : "Plan✕"}
      </LogoLink>

      {!compact && <EnvironmentSelect />}
    </HeaderRoot>
  );
};

export default NavMenuHeader;
