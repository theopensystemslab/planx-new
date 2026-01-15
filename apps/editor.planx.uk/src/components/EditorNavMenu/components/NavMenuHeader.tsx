import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import EnvironmentSelect from "components/EditorNavMenu/components/EnvironmentSelect";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { Link as ReactNaviLink } from "react-navi";

const HeaderRoot = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: theme.palette.background.dark,
  padding: theme.spacing(1),
}));

const LogoLink = styled(Link)(({ theme }) => ({
  color: theme.palette.common.white,
  textDecoration: "none",
})) as typeof Link;

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
        component={ReactNaviLink}
        href="/"
        prefetch={false}
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
