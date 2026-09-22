import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import EnvironmentSelect from "components/EditorNavMenu/components/EnvironmentSelect";
import { useStore } from "pages/FlowEditor/lib/store";
import { DEFAULT_PRIMARY_COLOR, FONT_WEIGHT_SEMI_BOLD } from "theme";
import { getEnvironmentLogo } from "ui/icons/logos";
import { CustomLink } from "ui/shared/CustomLink/CustomLink";

const HeaderRoot = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(1, 0.85),
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
  padding: theme.spacing(0.5),
  lineHeight: 0.5,
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
}));

const LogoIcon = styled("img")({
  width: 20,
  height: 20,
});

export interface NavMenuHeaderProps {
  compact?: boolean;
}

const NavMenuHeader: React.FC<NavMenuHeaderProps> = ({ compact = false }) => {
  const isStandalone = useStore(
    (state) => state.previewEnvironment === "standalone",
  );
  const teamColour = useStore((state) => state.teamTheme?.primaryColour);

  return (
    <HeaderRoot>
      <LogoLink
        to="/"
        preload={false}
        {...(isStandalone && { target: "_blank" })}
        variant="subtitle2"
      >
        <LogoIcon
          src={getEnvironmentLogo(teamColour ?? DEFAULT_PRIMARY_COLOR)}
          alt="PlanX logo"
        />
        {compact ? "" : "Plan✕"}
      </LogoLink>

      {!compact && <EnvironmentSelect />}
    </HeaderRoot>
  );
};

export default NavMenuHeader;
