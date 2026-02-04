import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import OpenInNewOffIcon from "@mui/icons-material/OpenInNewOff";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import { styled, Theme } from "@mui/material/styles";
import MuiToolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useLocation } from "@tanstack/react-router";
import AccountMenu from "components/AccountMenu";
import Breadcrumbs from "components/Breadcrumbs";
import { clearLocalFlowIdb } from "lib/local.idb";
import { capitalize } from "lodash";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analytics/provider";
import React, { RefObject, useRef, useState } from "react";
import {
  borderedFocusStyle,
  FONT_WEIGHT_SEMI_BOLD,
  LINE_HEIGHT_BASE,
} from "theme";
import { ApplicationPath } from "types";
import Reset from "ui/icons/Reset";
import { CustomLink } from "ui/shared/CustomLink/CustomLink";

import { useStore } from "../../pages/FlowEditor/lib/store";
import AnalyticsDisabledBanner from "../AnalyticsDisabled/AnalyticsDisabledBanner";
import { ConfirmationDialog } from "../ConfirmationDialog";
import { SectionNavBar } from "./Sections/NavBar";
import SkipLink from "./SkipLink";

export const HEADER_HEIGHT_PUBLIC = 74;
export const HEADER_HEIGHT_EDITOR = 56;

const Root = styled(AppBar)(({ theme }) => ({
  color: theme.palette.common.white,
}));

const PublicHeader = styled(MuiToolbar)(() => ({
  height: HEADER_HEIGHT_PUBLIC,
}));

const EditorHeader = styled(MuiToolbar)(({ theme }) => ({
  [theme.breakpoints.up("md")]: {
    minHeight: HEADER_HEIGHT_EDITOR,
  },
}));

const EditorHeaderContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(0, 2),
  "@media print": {
    background: theme.palette.background.dark,
    color: theme.palette.common.white,
  },
}));

const InnerContainer = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
}));

const LeftBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexGrow: 1,
  flexShrink: 0,
  flexBasis: "140px",
  justifyContent: "start",
  gap: theme.spacing(1.5),
}));

const RightBox = styled(Box)(() => ({
  display: "flex",
  flexGrow: 0,
  flexShrink: 0,
  flexBasis: "140px",
  justifyContent: "end",
}));

const Logo = styled("img")(() => ({
  height: HEADER_HEIGHT_PUBLIC - 5,
  width: "100%",
  maxWidth: 140,
  maxHeight: HEADER_HEIGHT_PUBLIC - 20,
  objectFit: "contain",
  "@media print": {
    filter: "invert(1)",
  },
}));

const ServiceTitleRoot = styled("span")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  flexGrow: 1,
  flexShrink: 1,
  lineHeight: LINE_HEIGHT_BASE,
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  paddingBottom: theme.spacing(1.5),
  [theme.breakpoints.up("md")]: {
    paddingBottom: 0,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

const TeamBrand: React.FC = () => {
  const [teamSettings, teamName, teamTheme] = useStore((state) => [
    state.teamSettings,
    state.teamName,
    state.teamTheme,
  ]);

  if (teamTheme?.logo) {
    const altText = teamSettings?.homepage
      ? `${teamName} Homepage (opens in a new tab)`
      : `${teamName} Logo`;

    const logo = <Logo alt={altText} src={teamTheme.logo} />;

    return teamSettings?.homepage ? (
      <CustomLink
        to={teamSettings.homepage}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none",
          "&:focus-visible": borderedFocusStyle,
        }}
      >
        {logo}
      </CustomLink>
    ) : (
      <Box sx={{ display: "flex", alignItems: "center" }}>{logo}</Box>
    );
  }

  const teamDisplayName = (
    <Typography
      variant="h4"
      component="span"
      fontWeight={FONT_WEIGHT_SEMI_BOLD}
      sx={{ whiteSpace: "nowrap" }}
    >
      {teamName}
    </Typography>
  );

  return teamSettings?.homepage ? (
    <CustomLink
      to={teamSettings.homepage}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        display: "flex",
        alignItems: "center",
        textDecoration: "none",
        color: "#FFF",
      }}
    >
      {teamDisplayName}
    </CustomLink>
  ) : (
    teamDisplayName
  );
};

const PublicToolbar: React.FC<{
  showResetButton?: boolean;
}> = ({ showResetButton = true }) => {
  const [path, id] = useStore((state) => [state.path, state.id]);

  // Center the service title on desktop layouts, or drop it to second line on mobile
  // ref https://design-system.service.gov.uk/styles/page-template/
  const showCentredServiceTitle = useMediaQuery((theme: Theme) =>
    theme.breakpoints.up("md"),
  );

  const { trackEvent } = useAnalyticsTracking();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const openConfirmationDialog = () => setIsDialogOpen(true);

  const handleRestart = (isConfirmed: boolean) => {
    setIsDialogOpen(false);
    if (isConfirmed) {
      trackEvent({
        event: "flowDirectionChange",
        metadata: null,
        flowDirection: "reset",
      });
      if (path === ApplicationPath.SingleSession) {
        clearLocalFlowIdb(id);
        window.location.reload();
      } else {
        // Save & Return flow
        // don't delete old flow for now
        // await NEW_LOCAL.clearLocalFlow(sessionId)
        const url = new URL(window.location.href);
        url.searchParams.delete("sessionId");
        window.location.href = url.href;
      }
    }
  };

  return (
    <>
      <SkipLink />
      <PublicHeader disableGutters>
        <Container maxWidth="contentWrap">
          <InnerContainer>
            <LeftBox>
              <TeamBrand />
            </LeftBox>
            {showCentredServiceTitle && <ServiceTitle />}
            <RightBox>
              {showResetButton && (
                <IconButton
                  color="secondary"
                  onClick={openConfirmationDialog}
                  aria-label="Restart Application"
                  size="large"
                  aria-describedby="restart-application-description"
                  sx={{ "@media print": { color: "black" } }}
                >
                  <Reset color="inherit" />
                  <Typography
                    id="restart-application-description"
                    variant="body2"
                    fontSize="small"
                    fontWeight={FONT_WEIGHT_SEMI_BOLD}
                    pl={0.5}
                  >
                    Restart
                  </Typography>
                </IconButton>
              )}
            </RightBox>
          </InnerContainer>
        </Container>
      </PublicHeader>
      {!showCentredServiceTitle && (
        <Container maxWidth={false}>
          <ServiceTitle />
        </Container>
      )}
      <SectionNavBar />
      <AnalyticsDisabledBanner />
      <ConfirmationDialog
        open={isDialogOpen}
        onClose={handleRestart}
        confirmText="Yes"
        cancelText="No"
      >
        <Typography>
          Are you sure you want to restart? This will delete your previous
          answers
        </Typography>
      </ConfirmationDialog>
    </>
  );
};

const ServiceTitle: React.FC = () => {
  const flowName = useStore((state) => state.flowName);
  const location = useLocation();
  const path = location.pathname.split("/").slice(-1)[0];

  return (
    <ServiceTitleRoot data-testid="service-title">
      {(path === "preview" || path === "draft") && (
        <Chip
          label={capitalize(path)}
          variant="notApplicableTag"
          size="medium"
          icon={
            {
              preview: <OpenInNewIcon fontSize="small" />,
              draft: <OpenInNewOffIcon fontSize="small" />,
            }[path]
          }
        />
      )}
      <Typography component="span" variant="h4">
        {flowName}
      </Typography>
    </ServiceTitleRoot>
  );
};

const EditorToolbar: React.FC<{
  headerRef: React.RefObject<HTMLElement>;
}> = () => {
  return (
    <>
      <EditorHeader disableGutters>
        <EditorHeaderContainer>
          <InnerContainer>
            <LeftBox>
              <Breadcrumbs showEnvironmentSelect />
            </LeftBox>
            <RightBox>
              <AccountMenu />
            </RightBox>
          </InnerContainer>
        </EditorHeaderContainer>
      </EditorHeader>
    </>
  );
};

interface ToolbarProps {
  headerRef: RefObject<HTMLDivElement>;
}

const Toolbar: React.FC<ToolbarProps> = ({ headerRef }) => {
  const location = useLocation();
  const path = location.pathname.split("/").slice(-1)[0] || undefined;
  const [flowSlug, previewEnvironment] = useStore((state) => [
    state.flowSlug,
    state.previewEnvironment,
  ]);

  // Editor and custom domains share a path, so we need to rely on previewEnvironment
  if (
    previewEnvironment === "editor" &&
    path !== "draft" &&
    path !== "preview"
  ) {
    return <EditorToolbar headerRef={headerRef}></EditorToolbar>;
  }

  switch (path) {
    case flowSlug: // Custom domains
    case "published":
    case "preview":
    case "draft":
    case "pay":
      return <PublicToolbar />;
    default:
      return <PublicToolbar showResetButton={false} />;
  }
};

const Header: React.FC = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const teamTheme = useStore((state) => state.teamTheme);

  return (
    <Root
      position="static"
      elevation={0}
      color="transparent"
      ref={headerRef}
      sx={(theme) => ({
        backgroundColor:
          teamTheme?.primaryColour || theme.palette.background.dark,
        "@media print": { backgroundColor: "white", color: "black" },
      })}
    >
      <Toolbar headerRef={headerRef} />
    </Root>
  );
};

export default Header;
