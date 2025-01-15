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
import React, { useState } from "react";
import { rootFlowPath } from "routes/utils";
import Permission from "ui/editor/Permission";
import Reset from "ui/icons/Reset";

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
  padding: theme.spacing(1, 2),
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
    opacity: "0.7",
    margin: "6px 4px 1px 4px",
    fontSize: "1.2rem",
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

export const TabList = styled(Box)(({ theme }) => ({
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
            <Box width="100%" display="flex">
              <input type="text" disabled value={urls.preview} />

              <Permission.IsPlatformAdmin>
                <Tooltip title="Open draft service">
                  <Link
                    href={urls.draft}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="inherit"
                  >
                    <OpenInNewOffIcon />
                  </Link>
                </Tooltip>
              </Permission.IsPlatformAdmin>

              <Tooltip title="Open preview of changes to publish">
                <Link
                  href={urls.preview}
                  target="_blank"
                  rel="noopener noreferrer"
                  color="inherit"
                >
                  <OpenInNewIcon />
                </Link>
              </Tooltip>

              {isFlowPublished ? (
                <Tooltip title="Open published service">
                  <Link
                    href={urls.analytics}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="inherit"
                  >
                    <LanguageIcon />
                  </Link>
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
    </Root>
  );
});

export default Sidebar;
