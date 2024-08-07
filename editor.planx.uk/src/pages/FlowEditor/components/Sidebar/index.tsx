import LanguageIcon from "@mui/icons-material/Language";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import OpenInNewOffIcon from "@mui/icons-material/OpenInNewOff";
import RefreshIcon from "@mui/icons-material/Refresh";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Tab, { tabClasses } from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { AxiosError } from "axios";
import { hasFeatureFlag } from "lib/featureFlags";
import { formatLastPublishMessage } from "pages/FlowEditor/utils";
import React, { useState } from "react";
import { useAsync } from "react-use";
import Permission from "ui/editor/Permission";
import Input from "ui/shared/Input";

import Questions from "../../../Preview/Questions";
import { useStore } from "../../lib/store";
import EditHistory from "./EditHistory";
import {
  AlteredNode,
  AlteredNodesSummaryContent,
  ValidationCheck,
  ValidationChecks,
} from "./PublishDialog";
import Search from "./Search";

type SidebarTabs = "PreviewBrowser" | "History" | "Search";

const Console = styled(Box)(() => ({
  overflow: "auto",
  padding: 20,
  maxHeight: "50%",
}));

const Root = styled(Box)(({ theme }) => ({
  position: "relative",
  top: "0",
  right: "0",
  bottom: "0",
  width: "500px",
  display: "flex",
  flexShrink: 0,
  flexDirection: "column",
  borderLeft: `1px solid ${theme.palette.border.main}`,
  background: theme.palette.background.paper,
  "& iframe": {
    flex: "1",
  },
}));

const SidebarContainer = styled(Box)(() => ({
  overflow: "auto",
  flex: 1,
  background: "#fff",
}));

const Header = styled("header")(({ theme }) => ({
  padding: theme.spacing(1),
  "& input": {
    flex: "1",
    padding: "5px",
    marginRight: "5px",
    background: theme.palette.common.white,
    border: "1px solid rgba(0, 0, 0, 0.2)",
  },
  "& svg": {
    cursor: "pointer",
    opacity: "0.7",
    margin: "6px 4px 1px 4px",
    fontSize: "1.2rem",
  },
}));

const TabList = styled(Box)(({ theme }) => ({
  position: "relative",
  // Use a pseudo element as border to allow for tab border overlap without excessive MUI overrides
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
  },
  // Hide default MUI indicator as we're using custom styling
  "& .MuiTabs-indicator": {
    display: "none",
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  position: "relative",
  zIndex: 1,
  textTransform: "none",
  background: "transparent",
  border: `1px solid transparent`,
  borderBottomColor: theme.palette.border.main,
  color: theme.palette.primary.main,
  fontWeight: "600",
  minHeight: "36px",
  margin: theme.spacing(0, 0.5),
  marginBottom: "-1px",
  padding: "0.5em",
  [`&.${tabClasses.selected}`]: {
    background: theme.palette.background.default,
    borderColor: theme.palette.border.main,
    borderBottomColor: theme.palette.common.white,
    color: theme.palette.text.primary,
  },
})) as typeof Tab;

const DebugConsole = () => {
  const [passport, breadcrumbs, flowId, cachedBreadcrumbs] = useStore(
    (state) => [
      state.computePassport(),
      state.breadcrumbs,
      state.id,
      state.cachedBreadcrumbs,
    ],
  );
  return (
    <Console borderTop={2} borderColor="border.main" bgcolor="background.paper">
      <Typography variant="body2">
        <a
          href={`${process.env.REACT_APP_API_URL}/flows/${flowId}/download-schema`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Download the flow schema
        </a>
      </Typography>
      <pre>
        {JSON.stringify({ passport, breadcrumbs, cachedBreadcrumbs }, null, 2)}
      </pre>
    </Console>
  );
};

const Sidebar: React.FC<{
  url: string;
}> = React.memo((props) => {
  const [showDebugConsole, setDebugConsoleVisibility] = useState(false);
  const [
    flowId,
    resetPreview,
    publishFlow,
    lastPublished,
    lastPublisher,
    validateAndDiffFlow,
    isFlowPublished,
  ] = useStore((state) => [
    state.id,
    state.resetPreview,
    state.publishFlow,
    state.lastPublished,
    state.lastPublisher,
    state.validateAndDiffFlow,
    state.isFlowPublished,
  ]);
  const [key, setKey] = useState<boolean>(false);
  const [lastPublishedTitle, setLastPublishedTitle] = useState<string>(
    "This flow is not published yet",
  );
  const [validationChecks, setValidationChecks] = useState<ValidationCheck[]>(
    [],
  );
  const [alteredNodes, setAlteredNodes] = useState<AlteredNode[]>();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [summary, setSummary] = useState<string>();
  const [activeTab, setActiveTab] = useState<SidebarTabs>("PreviewBrowser");

  const handleChange = (event: React.SyntheticEvent, newValue: SidebarTabs) => {
    setActiveTab(newValue);
  };

  const handleCheckForChangesToPublish = async () => {
    try {
      setLastPublishedTitle("Checking for changes...");
      const alteredFlow = await validateAndDiffFlow(flowId);
      setAlteredNodes(
        alteredFlow?.data.alteredNodes ? alteredFlow.data.alteredNodes : [],
      );
      setLastPublishedTitle(
        alteredFlow?.data.alteredNodes
          ? `Found changes to ${alteredFlow.data.alteredNodes.length} nodes`
          : alteredFlow?.data.message,
      );
      setValidationChecks(alteredFlow?.data?.validationChecks);
      setDialogOpen(true);
    } catch (error) {
      setLastPublishedTitle("Error checking for changes to publish");

      if (error instanceof AxiosError) {
        alert(error.response?.data?.error);
      } else {
        alert(
          `Error checking for changes to publish. Confirm that your graph does not have any corrupted nodes and that all external portals are valid. \n${error}`,
        );
      }
    }
  };

  const handlePublish = async () => {
    try {
      setDialogOpen(false);
      setLastPublishedTitle("Publishing changes...");
      const { alteredNodes, message } = await publishFlow(flowId, summary);
      setLastPublishedTitle(
        alteredNodes
          ? `Successfully published changes to ${alteredNodes.length} nodes`
          : `${message}` || "No new changes to publish",
      );
    } catch (error) {
      setLastPublishedTitle("Error trying to publish");
      alert(error);
    }
  };

  const _lastPublishedRequest = useAsync(async () => {
    const date = await lastPublished(flowId);
    const user = await lastPublisher(flowId);

    setLastPublishedTitle(formatLastPublishMessage(date, user));
  });

  const _validateAndDiffRequest = useAsync(async () => {
    const newChanges = await validateAndDiffFlow(flowId);
    setAlteredNodes(
      newChanges?.data.alteredNodes ? newChanges.data.alteredNodes : [],
    );
  });

  // useStore.getState().getTeam().slug undefined here, use window instead
  const teamSlug = window.location.pathname.split("/")[1];

  return (
    <Root>
      <Header>
        <Box width="100%" display="flex">
          <input
            type="text"
            disabled
            value={props.url.replace("/published", "/preview")}
          />

          <Tooltip arrow title="Refresh preview">
            <RefreshIcon
              onClick={() => {
                resetPreview();
                setKey((a) => !a);
              }}
            />
          </Tooltip>

          <Tooltip arrow title="Toggle debug console">
            <MenuOpenIcon
              onClick={() => setDebugConsoleVisibility(!showDebugConsole)}
            />
          </Tooltip>

          <Permission.IsPlatformAdmin>
            <Tooltip arrow title="Open draft service">
              <Link
                href={props.url.replace("/published", "/draft")}
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
              >
                <OpenInNewOffIcon />
              </Link>
            </Tooltip>
          </Permission.IsPlatformAdmin>

          <Tooltip arrow title="Open preview of changes to publish">
            <Link
              href={props.url.replace("/published", "/preview")}
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
            >
              <OpenInNewIcon />
            </Link>
          </Tooltip>

          {isFlowPublished ? (
            <Tooltip arrow title="Open published service">
              <Link
                href={props.url + "?analytics=false"}
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
              >
                <LanguageIcon />
              </Link>
            </Tooltip>
          ) : (
            <Tooltip arrow title="Flow not yet published">
              <Box>
                <Link component={"button"} disabled aria-disabled={true}>
                  <LanguageIcon />
                </Link>
              </Box>
            </Tooltip>
          )}
        </Box>
        <Box width="100%" mt={2}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-end"
            marginRight={1}
          >
            <Badge
              sx={{ width: "100%" }}
              badgeContent={alteredNodes && alteredNodes.length}
              max={999}
              color="warning"
            >
              <Button
                sx={{ width: "100%" }}
                variant="contained"
                color="primary"
                disabled={!useStore.getState().canUserEditTeam(teamSlug)}
                onClick={handleCheckForChangesToPublish}
              >
                CHECK FOR CHANGES TO PUBLISH
              </Button>
            </Badge>
            <Dialog
              open={dialogOpen}
              onClose={() => setDialogOpen(false)}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
              maxWidth="md"
            >
              <DialogTitle variant="h3" component="h1">
                {`Check for changes to publish`}
              </DialogTitle>
              <DialogContent>
                {alteredNodes?.length ? (
                  <>
                    <AlteredNodesSummaryContent
                      alteredNodes={alteredNodes}
                      lastPublishedTitle={lastPublishedTitle}
                    />
                    <ValidationChecks validationChecks={validationChecks} />
                    <Box pb={2}>
                      <Typography variant="body2">
                        {`Preview these content changes in-service before publishing `}
                        <Link
                          href={props.url.replace("/published", "/preview")}
                          target="_blank"
                        >
                          {`here (opens in a new tab).`}
                        </Link>
                      </Typography>
                    </Box>
                    <Input
                      bordered
                      type="text"
                      name="summary"
                      value={summary || ""}
                      placeholder="Summarise your changes..."
                      onChange={(e) => setSummary(e.target.value)}
                    />
                  </>
                ) : (
                  <Typography variant="body2">
                    {`No new changes to publish`}
                  </Typography>
                )}
              </DialogContent>
              <DialogActions sx={{ paddingX: 2 }}>
                <Button onClick={() => setDialogOpen(false)}>
                  KEEP EDITING
                </Button>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={handlePublish}
                  disabled={
                    !alteredNodes ||
                    alteredNodes.length === 0 ||
                    validationChecks.filter((v) => v.status === "Fail").length >
                      0
                  }
                >
                  PUBLISH
                </Button>
              </DialogActions>
            </Dialog>
            <Box mr={0}>
              <Typography variant="caption">{lastPublishedTitle}</Typography>
            </Box>
          </Box>
        </Box>
      </Header>
      <TabList>
        <Tabs centered onChange={handleChange} value={activeTab} aria-label="">
          <StyledTab
            disableFocusRipple
            disableTouchRipple
            disableRipple
            value="PreviewBrowser"
            label="Preview"
          />
          <StyledTab
            disableFocusRipple
            disableTouchRipple
            disableRipple
            value="History"
            label="History"
          />
          {hasFeatureFlag("SEARCH") && (
            <StyledTab
              disableFocusRipple
              disableTouchRipple
              disableRipple
              value="Search"
              label="Search"
            />
          )}
        </Tabs>
      </TabList>
      {activeTab === "PreviewBrowser" && (
        <SidebarContainer>
          <Questions previewEnvironment="editor" key={String(key)} />
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
        <SidebarContainer py={3}>
          <Search />
        </SidebarContainer>
      )}
      {showDebugConsole && <DebugConsole />}
    </Root>
  );
});

export default Sidebar;
