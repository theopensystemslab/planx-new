import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import EnvironmentSelect from "components/EditorNavMenu/components/EnvironmentSelect";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { CustomLink } from "ui/shared/CustomLink/CustomLink";

const HeaderRoot = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: theme.palette.background.dark,
  padding: theme.spacing(1),
}));

const LogoLink = styled(CustomLink)(({ theme }) => ({
  color: theme.palette.common.white,
  textDecoration: "none",
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
        {...(isStandalone && { target: "_blank" })}
        variant="subtitle1"
      >
        {compact ? "P✕" : "Plan✕"}
      </LogoLink>

      {!compact && <EnvironmentSelect />}
    </HeaderRoot>
  );
};

export default NavMenuHeader;
