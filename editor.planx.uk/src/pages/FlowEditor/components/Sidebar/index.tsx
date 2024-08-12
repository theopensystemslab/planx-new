import AccountTreeIcon from "@mui/icons-material/AccountTree";
import LinkIcon from "@mui/icons-material/Link";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import RefreshIcon from "@mui/icons-material/Refresh";
import SchemaIcon from "@mui/icons-material/Schema";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
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
import Input from "ui/shared/Input";

import Questions from "../../../Preview/Questions";
import { useStore } from "../../lib/store";
import EditHistory from "./EditHistory";
import LinkDialog from "./LinkDialog";
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
    background: theme.palette.background.paper,

    border: "1px solid rgba(0, 0, 0, 0.2)",
  },
}));

const SecondaryButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.common.black,
}));

const ViewButton = styled(Button)(({ theme }) => ({
  background: theme.palette.common.white,
  border: `1px solid ${theme.palette.border.main}`,
  boxShadow: "none",
  color: theme.palette.common.black,
  width: "33%",
  display: "flex",
  flexDirection: "row",
  gap: "8px",
  borderRadius: "5px",
  padding: "8px",
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
    fetchCurrentTeam,
    togglePreview,
    flowSlug,
    teamSlug,
    teamDomain,
  ] = useStore((state) => [
    state.id,
    state.resetPreview,
    state.publishFlow,
    state.lastPublished,
    state.lastPublisher,
    state.validateAndDiffFlow,
    state.isFlowPublished,
    state.fetchCurrentTeam,
    state.togglePreview,
    state.flowSlug,
    state.teamSlug,
    state.teamDomain,
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
  const [linkDialogOpen, setLinkDialogOpen] = useState<boolean>(false);

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

  return (
    <Root>
      <Header>
        <Box
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"flex-end"}
          padding={"0px 20px"}
          gap={"8px"}
        >
          <SecondaryButton color="primary">
            <Tooltip arrow title="Refresh preview">
              <RefreshIcon
                onClick={() => {
                  resetPreview();
                  setKey((a) => !a);
                }}
              />
            </Tooltip>
          </SecondaryButton>
          <SecondaryButton color="primary">
            <Tooltip arrow title="Toggle debug console">
              <AccountTreeIcon
                onClick={() => setDebugConsoleVisibility(!showDebugConsole)}
              />
            </Tooltip>
          </SecondaryButton>
        </Box>
        <Box
          width="100%"
          mt={2}
          mb={4}
          pl={2}
          pr={2}
          display="flex"
          flexDirection="row"
          gap={"24px"}
          style={{ position: "relative" }}
          justifyContent={"space-between"}
        >
          <ViewButton
            onClick={() => setLinkDialogOpen(true)}
            disabled={!useStore.getState().canUserEditTeam(teamSlug)}
          >
            <LinkIcon fontSize="medium" /> View links
          </ViewButton>
          <LinkDialog
            setLinkDialogOpen={setLinkDialogOpen}
            linkDialogOpen={linkDialogOpen}
            teamDomain={teamDomain}
            teamSlug={teamSlug}
            flowSlug={flowSlug}
            isFlowPublished={isFlowPublished}
            url={props.url}
          />

          <Box display="flex" flexDirection="column" alignItems="flex-end">
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
                Check for changes to publish
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
            <Box mr={0} sx={{ position: "relative", width: "100%" }}>
              <Typography
                sx={{ position: "absolute", width: "100%", left: 0 }}
                variant="caption"
              >
                {lastPublishedTitle}
              </Typography>
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
