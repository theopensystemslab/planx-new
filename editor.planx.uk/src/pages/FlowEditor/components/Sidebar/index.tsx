import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LanguageIcon from "@mui/icons-material/Language";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import OpenInNewOffIcon from "@mui/icons-material/OpenInNewOff";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Tabs from "@mui/material/Tabs";
import ToggleButton from "@mui/material/ToggleButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { ConfirmationDialog } from "components/ConfirmationDialog";
import React, { useState } from "react";
import { rootFlowPath } from "routes/utils";
import Permission from "ui/editor/Permission";
import Reset from "ui/icons/Reset";
import { Switch } from "ui/shared/Switch";

import Questions from "../../../Preview/Questions";
import { useStore } from "../../lib/store";
import { DebugConsole } from "./DebugConsole";
import EditHistory from "./EditHistory";
import { PublishFlowButton } from "./Publish/PublishFlowButton";
import Search from "./Search";
import StyledTab from "./StyledTab";

type SidebarTabs = "PreviewBrowser" | "History" | "Search" | "Console";

const SIDEBAR_WIDTH = "500px";
const SIDEBAR_WIDTH_MINIMISED = "20px";

const Root = styled(Box)(({ theme }) => ({
  position: "relative",
  top: "0",
  right: "0",
  bottom: "0",
  display: "flex",
  flexShrink: 0,
  flexDirection: "column",
  borderLeft: `1px solid ${theme.palette.border.main}`,
  background: theme.palette.background.paper,
  zIndex: 1,
}));

const SidebarContainer = styled(Box)(() => ({
  overflow: "auto",
  flex: 1,
  background: "#fff",
  position: "relative",
}));

const SidebarWrapper = styled(Box)(() => ({
  width: SIDEBAR_WIDTH,
  display: "flex",
  flexDirection: "column",
  flexShrink: 0,
  flexGrow: 1,
  height: "100%",
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.border.main}`,
  borderImage: `linear-gradient(to right, ${theme.palette.border.main} 50%, transparent 50%) 30% 1`,
  position: "absolute",
  width: "40px",
  height: "40px",
  left: "-20px",
  top: theme.spacing(0.5),
  boxShadow: "none",
  color: theme.palette.text.primary,
  "& > svg": {
    fontSize: "1.875rem",
  },
  "&:hover": {
    background: theme.palette.background.paper,
    boxShadow: "none",
  },
}));

const Header = styled("header")(({ theme }) => ({
  padding: theme.spacing(1, 2, 0, 2),
  "& input": {
    flex: "1",
    padding: "5px",
    marginRight: "5px",
    background: theme.palette.common.white,
    border: "1px solid ${theme.palette.border.main}",
    borderWidth: "1px",
  },
  "& svg": {
    cursor: "pointer",
    opacity: 0.9,
    margin: theme.spacing(0, 0.6),
    fontSize: "1.5rem",
  },
}));

const ResetToggle = styled(Button)(({ theme }) => ({
  position: "absolute",
  top: 0,
  right: theme.spacing(3),
  padding: theme.spacing(1, 1, 1, 0),
  textDecorationStyle: "solid",
  color: theme.palette.text.primary,
}));

const TabList = styled(Box)(({ theme }) => ({
  position: "relative",
  "&::after": {
    content: "''",
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: "1px",
    backgroundColor: theme.palette.border.main,
  },
  "& .MuiTabs-root": {
    minHeight: "0",
    padding: theme.spacing(0, 1.75),
  },
  "& .MuiTabs-indicator": {
    display: "none",
  },
}));

const PlatformLink = styled(Link)(() => ({
  color: "inherit",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
})) as typeof Link;

const Sidebar: React.FC = React.memo(() => {
  const [resetPreview, isFlowPublished, toggleSidebar, showSidebar] = useStore(
    (state) => [
      state.resetPreview,
      state.isFlowPublished,
      state.toggleSidebar,
      state.showSidebar,
    ],
  );

  const [activeTab, setActiveTab] = useState<SidebarTabs>("PreviewBrowser");

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDialogOpen(event.target.checked);
  };

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: SidebarTabs,
  ) => {
    setActiveTab(newValue);
  };

  const baseUrl = `${window.location.origin}${rootFlowPath(false)}`;

  const urls = {
    preview: baseUrl + "/preview",
    draft: baseUrl + "/draft",
    analytics: baseUrl + "/published" + "?analytics=false",
  };

  return (
    <Root>
      <Collapse
        in={showSidebar}
        orientation="horizontal"
        collapsedSize={SIDEBAR_WIDTH_MINIMISED}
        sx={{ height: "100%" }}
        easing={"ease-in-out"}
        timeout={200}
      >
        <SidebarWrapper>
          <StyledToggleButton onClick={toggleSidebar} value="toggleSidebar">
            {showSidebar ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </StyledToggleButton>
          <Header>
            <Box
              display="flex"
              width="100%"
              sx={{ alignItems: "center", gap: 1 }}
            >
              <Box display="flex">
                <Permission.IsPlatformAdmin>
                  <Tooltip title="Open draft service">
                    <PlatformLink
                      href={urls.draft}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <OpenInNewOffIcon />
                    </PlatformLink>
                  </Tooltip>
                </Permission.IsPlatformAdmin>

                <Tooltip title="Open preview of changes to publish">
                  <PlatformLink
                    href={urls.preview}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <OpenInNewIcon />
                  </PlatformLink>
                </Tooltip>

                {isFlowPublished ? (
                  <Tooltip title="Open published service">
                    <PlatformLink
                      href={urls.analytics}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <LanguageIcon />
                    </PlatformLink>
                  </Tooltip>
                ) : (
                  <Tooltip title="Flow not yet published">
                    <Box>
                      <Link component={"button"} disabled aria-disabled={true}>
                        <LanguageIcon />
                      </Link>
                    </Box>
                  </Tooltip>
                )}
              </Box>
              <PublishFlowButton previewURL={urls.preview} />
            </Box>
            <Switch
              checked={dialogOpen}
              onChange={handleSwitchChange}
              label="Service online"
            />
          </Header>
          <TabList>
            <Tabs onChange={handleChange} value={activeTab} aria-label="">
              <StyledTab value="PreviewBrowser" label="Preview" />
              <StyledTab value="History" label="History" />
              <StyledTab value="Search" label="Search" />
              <StyledTab value="Console" label="Console" />
            </Tabs>
          </TabList>
          {activeTab === "PreviewBrowser" && (
            <SidebarContainer>
              <ResetToggle
                variant="link"
                onClick={() => {
                  resetPreview();
                }}
              >
                <Reset fontSize="small" />
                Restart
              </ResetToggle>
              <Questions previewEnvironment="editor" />
            </SidebarContainer>
          )}
          {activeTab === "History" && (
            <SidebarContainer py={3}>
              <Container>
                <EditHistory />
              </Container>
            </SidebarContainer>
          )}
          {activeTab === "Search" && (
            <SidebarContainer>
              <Search />
            </SidebarContainer>
          )}
          {activeTab === "Console" && (
            <SidebarContainer>
              <DebugConsole />
            </SidebarContainer>
          )}
        </SidebarWrapper>
      </Collapse>
      <ConfirmationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Set service online"
        confirmText="Set service online"
        cancelText="Cancel"
      >
        <Typography variant="body1" gutterBottom>
          Toggle your service to be "online".
        </Typography>
        <Typography variant="body1" gutterBottom>
          A service must be online to be accessed by the public, to accept
          responses, and to enable analytics gathering.
        </Typography>
        <Typography variant="body1" gutterBottom>
          Offline services can still be edited and published as normal.
        </Typography>
      </ConfirmationDialog>
    </Root>
  );
});

export default Sidebar;
