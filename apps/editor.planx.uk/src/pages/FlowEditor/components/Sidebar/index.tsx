import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import OpenInNewOffIcon from "@mui/icons-material/OpenInNewOff";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import { styled } from "@mui/material/styles";
import Tabs, { tabsClasses } from "@mui/material/Tabs";
import ToggleButton from "@mui/material/ToggleButton";
import Tooltip from "@mui/material/Tooltip";
import { useParams, useRouteContext, useRouter } from "@tanstack/react-router";
import React, { useState } from "react";
import { useLocation } from "react-use";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import Permission from "ui/editor/Permission";
import StyledTab from "ui/editor/StyledTab";
import { CustomLink } from "ui/shared/CustomLink/CustomLink";

import { useStore } from "../../lib/store";
import Customisations from "./Customisations";
import { DebugConsole } from "./DebugConsole";
import EditHistory from "./EditHistory";
import { PreviewBrowser } from "./PreviewBrowser";
import { CheckForChangesToPublishButton } from "./Publish/CheckForChangesButton";
import Reviews from "./Review";
import Search from "./Search";

type SidebarTabs =
  | "PreviewBrowser"
  | "History"
  | "Search"
  | "Console"
  | "Customise"
  | "Review";

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

const SidebarContainer = styled(Box)(({ theme }) => ({
  overflow: "auto",
  flex: 1,
  background: theme.palette.background.default,
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
}));

const ViewServiceRow = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  flexWrap: "wrap",
}));

const ViewServiceButton = styled(CustomLink)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: theme.spacing(0.5),
  padding: theme.spacing(0.5, 0.75),
  fontSize: "0.8125rem",
  fontWeight: 600,
  color: theme.palette.text.primary,
  textDecoration: "none",
  border: `1px solid ${theme.palette.border.main}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  cursor: "pointer",
  transition: "background-color 0.15s ease",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
  "& svg": {
    fontSize: "1.15rem",
  },
})) as typeof CustomLink;

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
  [`& .${tabsClasses.root}`]: {
    minHeight: "0",
    padding: theme.spacing(0, 1.75),
  },
  [`& .${tabsClasses.indicator}`]: {
    display: "none",
  },
}));

const Sidebar: React.FC = React.memo(() => {
  const [isFlowPublished, toggleSidebar, showSidebar, isTemplatedFrom] =
    useStore((state) => [
      state.isFlowPublished,
      state.toggleSidebar,
      state.showSidebar,
      state.isTemplatedFrom,
    ]);

  const defaultActiveTab = isTemplatedFrom ? "Customise" : "PreviewBrowser";
  const [activeTab, setActiveTab] = useState<SidebarTabs>(defaultActiveTab);
  const { team } = useParams({ from: "/_authenticated/app/$team/$flow" });
  const { rootFlow } = useRouteContext({
    from: "/_authenticated/app/$team/$flow",
  });

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: SidebarTabs,
  ) => {
    setActiveTab(newValue);
  };

  const router = useRouter();
  const { origin } = useLocation();

  const previewPath = router.buildLocation({
    to: "/$team/$flow/preview",
    params: { team, flow: rootFlow },
  }).href;

  const previewURL = `${origin}${previewPath}`;

  const publishedPath = router.buildLocation({
    to: "/$team/$flow/published",
    params: { team, flow: rootFlow },
    search: { analytics: false },
  }).href;

  const publishedURL = `${origin}${publishedPath}`;

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
            <ViewServiceRow>
              <Permission.IsPlatformAdmin>
                <Tooltip title="Open draft service">
                  <span>
                    <ViewServiceButton
                      to="/$team/$flow/draft"
                      params={{ team, flow: rootFlow }}
                      target="_blank"
                      rel="noopener noreferrer"
                      preload={false}
                    >
                      <PlayArrowIcon />
                      Draft
                    </ViewServiceButton>
                  </span>
                </Tooltip>
              </Permission.IsPlatformAdmin>

              <Tooltip title="Open preview of changes to publish">
                <span>
                  <ViewServiceButton
                    to="/$team/$flow/preview"
                    params={{ team, flow: rootFlow }}
                    target="_blank"
                    rel="noopener noreferrer"
                    preload={false}
                    aria-label="Open preview of changes to publish"
                  >
                    <PlayArrowIcon />
                    Preview
                  </ViewServiceButton>
                </span>
              </Tooltip>
            </ViewServiceRow>

            <CheckForChangesToPublishButton
              previewURL={previewURL}
              isFlowPublished={isFlowPublished}
              publishedURL={publishedURL}
            />
          </Header>

          <TabList>
            <Tabs onChange={handleChange} value={activeTab} aria-label="">
              {isTemplatedFrom && (
                <StyledTab value="Customise" label="Customise" />
              )}
              <StyledTab value="PreviewBrowser" label="Preview" />
              <StyledTab value="History" label="History" />
              <StyledTab value="Search" label="Search" />
              {!isTemplatedFrom && (
                <StyledTab value="Review" label="To review" />
              )}
              <StyledTab value="Console" label="Console" />
            </Tabs>
          </TabList>
          {activeTab === "Customise" && (
            <SidebarContainer>
              <Customisations />
            </SidebarContainer>
          )}
          {activeTab === "PreviewBrowser" && (
            <SidebarContainer>
              <PreviewBrowser />
            </SidebarContainer>
          )}
          {activeTab === "History" && (
            <SidebarContainer>
              <EditHistory />
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
          {activeTab === "Review" && (
            <SidebarContainer>
              <Reviews />
            </SidebarContainer>
          )}
        </SidebarWrapper>
      </Collapse>
    </Root>
  );
});

export default Sidebar;
