import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import OpenInNewOffIcon from "@mui/icons-material/OpenInNewOff";
import Person from "@mui/icons-material/Person";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { grey } from "@mui/material/colors";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Popover, { popoverClasses } from "@mui/material/Popover";
import { styled, Theme } from "@mui/material/styles";
import MuiToolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useMutation } from "@tanstack/react-query";
import EnvironmentSelect from "components/EditorNavMenu/components/EnvironmentSelect";
import { logout } from "lib/api/auth/requests";
import { clearLocalFlowIdb } from "lib/local.idb";
import { capitalize } from "lodash";
import { Route } from "navi";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analytics/provider";
import React, { RefObject, useRef, useState } from "react";
import {
  Link as ReactNaviLink,
  useCurrentRoute,
  useNavigation,
} from "react-navi";
import {
  borderedFocusStyle,
  FONT_WEIGHT_SEMI_BOLD,
  LINE_HEIGHT_BASE,
} from "theme";
import { ApplicationPath } from "types";
import FlowTag from "ui/editor/FlowTag/FlowTag";
import { FlowTagType } from "ui/editor/FlowTag/types";
import Reset from "ui/icons/Reset";

import { useStore } from "../../pages/FlowEditor/lib/store";
import { rootFlowPath } from "../../routes/utils";
import AnalyticsDisabledBanner from "../AnalyticsDisabled/AnalyticsDisabledBanner";
import { ConfirmationDialog } from "../ConfirmationDialog";
import { SectionNavBar } from "./Sections/NavBar";
import SkipLink from "./SkipLink";

export const HEADER_HEIGHT_PUBLIC = 74;
export const HEADER_HEIGHT_EDITOR = 56;

const Root = styled(AppBar)(({ theme }) => ({
  color: theme.palette.common.white,
}));

const BreadcrumbsRoot = styled(Box)(() => ({
  cursor: "pointer",
  fontSize: 20,
  display: "flex",
  columnGap: 10,
  alignItems: "center",
}));

const BreadcrumbsLink = styled(Link)(({ theme }) => ({
  color: theme.palette.common.white,
  textDecoration: "none",
  borderBottom: "1px solid rgba(255, 255, 255, 0.75)",
})) as typeof Link;

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

const ProfileSection = styled(MuiToolbar)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginRight: theme.spacing(1),
  [theme.breakpoints.up("md")]: {
    minHeight: HEADER_HEIGHT_EDITOR,
  },
  "@media print": {
    visibility: "hidden",
  },
}));

const StyledPopover = styled(Popover)(({ theme }) => ({
  [`& .${popoverClasses.paper}`]: {
    boxShadow: "4px 4px 0px rgba(150, 150, 150, 0.5)",
    backgroundColor: theme.palette.background.dark,
    borderRadius: 0,
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.dark,
  color: theme.palette.common.white,
  borderRadius: 0,
  boxShadow: "none",
  minWidth: 180,
  "& li": {
    padding: theme.spacing(1.5, 2),
  },
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

const LogoLink = styled(Link)(() => ({
  display: "flex",
  alignItems: "center",
  "&:focus-visible": borderedFocusStyle,
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

const TeamLogo: React.FC = () => {
  const [teamSettings, teamName, teamTheme] = useStore((state) => [
    state.teamSettings,
    state.teamName,
    state.teamTheme,
  ]);

  const altText = teamSettings?.homepage
    ? `${teamName} Homepage (opens in a new tab)`
    : `${teamName} Logo`;
  const logo = <Logo alt={altText} src={teamTheme?.logo ?? undefined} />;
  return teamSettings?.homepage ? (
    <LogoLink href={teamSettings?.homepage} target="_blank">
      {logo}
    </LogoLink>
  ) : (
    logo
  );
};

const Breadcrumbs: React.FC<{ showEnvironmentSelect?: boolean }> = ({
  showEnvironmentSelect = false,
}) => {
  const route = useCurrentRoute();
  const [team, isStandalone] = useStore((state) => [
    state.getTeam(),
    state.previewEnvironment === "standalone",
  ]);

  const flowStatus = useStore((state) => state.flowStatus);

  return (
    <>
      <BreadcrumbsRoot>
        <BreadcrumbsLink
          component={ReactNaviLink}
          href={"/"}
          prefetch={false}
          {...(isStandalone && { target: "_blank" })}
          variant="body1"
        >
          Plan✕
        </BreadcrumbsLink>
        {showEnvironmentSelect && <EnvironmentSelect />}
        {team.slug && (
          <>
            {" / "}
            <BreadcrumbsLink
              component={ReactNaviLink}
              href={`/${team.slug}`}
              prefetch={false}
              {...(isStandalone && { target: "_blank" })}
              variant="body1"
            >
              {team.slug}
            </BreadcrumbsLink>
          </>
        )}
        {route.data.flow && (
          <>
            {" / "}
            <Link
              style={{
                color: "#fff",
                textDecoration: "none",
              }}
              component={ReactNaviLink}
              href={rootFlowPath(false)}
              prefetch={false}
              variant="body1"
            >
              {route.data.flow}
            </Link>
          </>
        )}
      </BreadcrumbsRoot>
      {route.data.flow && (
        <Box sx={(theme) => ({ color: theme.palette.text.primary })}>
          {useStore.getState().canUserEditTeam(team.slug) ? (
            <Button
              variant="link"
              href={`/${team.slug}/${route.data.flow}/settings`}
              title="Update service status"
              sx={{ textDecoration: "none" }}
            >
              <FlowTag tagType={FlowTagType.Status} statusVariant={flowStatus}>
                {flowStatus}
              </FlowTag>
            </Button>
          ) : (
            <FlowTag tagType={FlowTagType.Status} statusVariant={flowStatus}>
              {flowStatus}
            </FlowTag>
          )}
        </Box>
      )}
    </>
  );
};

const PublicToolbar: React.FC<{
  showResetButton?: boolean;
}> = ({ showResetButton = true }) => {
  const [path, id, teamTheme] = useStore((state) => [
    state.path,
    state.id,
    state.teamTheme,
  ]);

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
              {teamTheme?.logo ? <TeamLogo /> : <Breadcrumbs />}
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
  const route = useCurrentRoute();
  const path = route.url.pathname.split("/").slice(-1)[0];

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
  route: Route;
}> = ({ headerRef }) => {
  const { navigate } = useNavigation();
  const [open, setOpen] = useState(false);
  const user = useStore((state) => state.user);

  const handleClose = () => {
    setOpen(false);
  };

  const handleMenuToggle = () => {
    setOpen(!open);
  };

  const logoutMutation = useMutation({
    mutationKey: ["logout", user?.id],
    mutationFn: logout,
    onSuccess: () => navigate("/logout"),
  });

  const handleLogout = () => logoutMutation.mutate();

  return (
    <>
      <EditorHeader disableGutters>
        <EditorHeaderContainer>
          <InnerContainer>
            <LeftBox>
              <Breadcrumbs showEnvironmentSelect />
            </LeftBox>
            <RightBox>
              {user && (
                <ProfileSection disableGutters>
                  <Box mr={1} />
                  <IconButton
                    edge="end"
                    color="inherit"
                    aria-label="Toggle Menu"
                    onClick={handleMenuToggle}
                    size="large"
                    sx={{ padding: "0.25em" }}
                  >
                    <Avatar
                      component="span"
                      sx={{
                        bgcolor: grey[200],
                        color: "text.primary",
                        fontSize: "1rem",
                        fontWeight: FONT_WEIGHT_SEMI_BOLD,
                        width: 33,
                        height: 33,
                        marginRight: "0.5rem",
                      }}
                    >
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </Avatar>
                    <Typography variant="body3">Account</Typography>
                    <KeyboardArrowDown />
                  </IconButton>
                </ProfileSection>
              )}
            </RightBox>
          </InnerContainer>
        </EditorHeaderContainer>
      </EditorHeader>
      {user && (
        <StyledPopover
          open={open}
          anchorEl={headerRef.current}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <StyledPaper>
            <MenuItem disabled>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>{user.email}</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLogout}>Log out</MenuItem>
          </StyledPaper>
        </StyledPopover>
      )}
    </>
  );
};

interface ToolbarProps {
  headerRef: RefObject<HTMLDivElement>;
}

const Toolbar: React.FC<ToolbarProps> = ({ headerRef }) => {
  const route = useCurrentRoute();
  const path = route.url.pathname.split("/").slice(-1)[0] || undefined;
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
    return <EditorToolbar headerRef={headerRef} route={route}></EditorToolbar>;
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
