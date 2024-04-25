import LanguageIcon from "@mui/icons-material/Language";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import OpenInNewOffIcon from "@mui/icons-material/OpenInNewOff";
import RefreshIcon from "@mui/icons-material/Refresh";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { styled } from "@mui/material/styles";
import Tab, { tabClasses } from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { AxiosError } from "axios";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import React, { useState } from "react";
import { useAsync } from "react-use";
import Caret from "ui/icons/Caret";
import Input from "ui/shared/Input";

import Questions from "../../Preview/Questions";
import EditHistory from "./EditHistory";
import { useStore } from "../lib/store";

const Console = styled(Box)(() => ({
  overflow: "auto",
  padding: 20,
  maxHeight: "50%",
}));

const EmbeddedBrowser = styled(Box)(({ theme }) => ({
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

const formatLastPublish = (date: string, user: string) =>
  `Last published ${formatDistanceToNow(new Date(date))} ago by ${user}`;

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

interface AlteredNode {
  id: string;
  type: TYPES;
  data?: any;
}

type SideBarTabs = "PreviewBrowser" | "History";

const AlteredNodeListItem = (props: { node: AlteredNode }) => {
  const { node } = props;
  let text, data;

  if (node.id === "_root") {
    text = "Changed _root service by adding, deleting or re-ordering nodes";
  } else if (node.id === "0") {
    text = `The entire _root service will be published for the first time`;
  } else if (node.id && Object.keys(node).length === 1) {
    text = `Deleted node ${node.id}`;
  } else if (node.type && node.data) {
    text = `Added/edited ${TYPES[node.type]}`;
    data = JSON.stringify(node.data, null, 2);
  } else {
    text = `Added/edited ${TYPES[node.type]}`;
  }

  return (
    <li key={node.id}>
      <Typography variant="body2">{text}</Typography>
      {data && <pre style={{ fontSize: ".8em" }}>{data}</pre>}
    </li>
  );
};

interface Portal {
  text: string;
  flowId: string;
  publishedFlowId: number;
  summary: string;
  publishedBy: number;
  publishedAt: string;
}

const AlteredNestedFlowListItem = (props: Portal) => {
  const { text, flowId, publishedFlowId, summary, publishedAt } = props;

  const [nestedFlowLastPublishedTitle, setNestedFlowLastPublishedTitle] =
    useState<string>();
  const lastPublisher = useStore((state) => state.lastPublisher);

  const _nestedFlowLastPublishedRequest = useAsync(async () => {
    const user = await lastPublisher(flowId);
    setNestedFlowLastPublishedTitle(formatLastPublish(publishedAt, user));
  });

  return (
    <ListItem
      key={publishedFlowId}
      disablePadding
      sx={{ display: "list-item" }}
    >
      <ListItemText
        primary={
          useStore.getState().canUserEditTeam(text.split("/")[0]) ? (
            <Link href={`../${text}`} target="_blank">
              <Typography variant="body2">{text}</Typography>
            </Link>
          ) : (
            <Typography variant="body2">{text}</Typography>
          )
        }
        secondary={
          <>
            <Typography variant="body2" fontSize="small">
              {nestedFlowLastPublishedTitle}
            </Typography>
            {summary && (
              <Typography variant="body2" fontSize="small">
                {summary}
              </Typography>
            )}
          </>
        }
      />
    </ListItem>
  );
};

interface AlteredNodesSummary {
  title: string;
  portals: Portal[];
  updated: number;
  deleted: number;
}

const AlteredNodesSummaryContent = (props: {
  alteredNodes: AlteredNode[];
  url: string;
}) => {
  const { alteredNodes, url } = props;
  const [expandNodes, setExpandNodes] = useState<boolean>(false);

  const changeSummary: AlteredNodesSummary = {
    title: "",
    portals: [],
    updated: 0,
    deleted: 0,
  };

  alteredNodes.map((node) => {
    if (node.id === "0") {
      changeSummary["title"] =
        "You are publishing the main service for the first time.";
    } else if (node.id && Object.keys(node).length === 1) {
      changeSummary["deleted"] += 1;
    } else if (node.type === TYPES.InternalPortal) {
      if (node.data?.text?.includes("/")) {
        changeSummary["portals"].push({ ...node.data, flowId: node.id });
      }
    } else if (node.type) {
      changeSummary["updated"] += 1;
    }

    return changeSummary;
  });

  return (
    <Box pb={2}>
      {changeSummary["title"] && (
        <Typography variant="body2" pb={2}>
          {changeSummary["title"]}
        </Typography>
      )}
      {(changeSummary["updated"] > 0 || changeSummary["deleted"] > 0) && (
        <Box pb={2}>
          <ul>
            <li key={"updated"}>
              <Typography variant="body2">{`${changeSummary["updated"]} nodes have been updated or added`}</Typography>
            </li>
            <li key={"deleted"}>
              <Typography variant="body2">{`${changeSummary["deleted"]} nodes have been deleted`}</Typography>
            </li>
          </ul>
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              marginBottom: 2,
            }}
          >
            <Box
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Typography variant="body2">{`See detailed changelog `}</Typography>
              <Button
                onClick={() => setExpandNodes((expandNodes) => !expandNodes)}
                size="small"
                disableRipple
              >
                <Caret
                  expanded={expandNodes}
                  color="primary"
                  titleAccess={
                    expandNodes ? "Less information" : "More information"
                  }
                />
              </Button>
            </Box>
            <Collapse in={expandNodes}>
              <Box pb={1}>
                <ul>
                  {alteredNodes.map((node) => (
                    <AlteredNodeListItem node={node} />
                  ))}
                </ul>
              </Box>
            </Collapse>
          </Box>
        </Box>
      )}
      <Divider />
      {changeSummary["portals"].length > 0 && (
        <Box pt={2}>
          <Typography variant="body2">{`This includes recently published changes in the following nested services:`}</Typography>
          <List sx={{ listStyleType: "disc", marginLeft: 4 }}>
            {changeSummary["portals"].map((portal) => (
              <AlteredNestedFlowListItem {...portal} />
            ))}
          </List>
        </Box>
      )}
      <Divider />
      <Box pt={2}>
        <Typography variant="body2">
          {`Preview these content changes in-service before publishing `}
          <Link href={url.replace("/published", "/preview")} target="_blank">
            {`here (opens in a new tab).`}
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

const PreviewBrowser: React.FC<{
  url: string;
}> = React.memo((props) => {
  const [showDebugConsole, setDebugConsoleVisibility] = useState(false);
  const [
    flowId,
    flowAnalyticsLink,
    resetPreview,
    publishFlow,
    lastPublished,
    lastPublisher,
    validateAndDiffFlow,
    isFlowPublished,
    isPlatformAdmin,
  ] = useStore((state) => [
    state.id,
    state.flowAnalyticsLink,
    state.resetPreview,
    state.publishFlow,
    state.lastPublished,
    state.lastPublisher,
    state.validateAndDiffFlow,
    state.isFlowPublished,
    state.user?.isPlatformAdmin,
  ]);
  const [key, setKey] = useState<boolean>(false);
  const [lastPublishedTitle, setLastPublishedTitle] = useState<string>(
    "This flow is not published yet",
  );
  const [validationMessage, setValidationMessage] = useState<string>();
  const [alteredNodes, setAlteredNodes] = useState<AlteredNode[]>();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [summary, setSummary] = useState<string>();
  const [activeTab, setActiveTab] = useState<SideBarTabs>("PreviewBrowser");

  const handleChange = (event: React.SyntheticEvent, newValue: SideBarTabs) => {
    setActiveTab(newValue);
  };

  const _lastPublishedRequest = useAsync(async () => {
    const date = await lastPublished(flowId);
    const user = await lastPublisher(flowId);

    setLastPublishedTitle(formatLastPublish(date, user));
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
    <EmbeddedBrowser id="embedded-browser">
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

          {flowAnalyticsLink ? (
            <Tooltip arrow title="Open analytics page">
              <Link
                href={flowAnalyticsLink}
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
              >
                <SignalCellularAltIcon />
              </Link>
            </Tooltip>
          ) : (
            <Tooltip arrow title="Analytics page unavailable">
              <Box>
                <Link component={"button"} disabled aria-disabled={true}>
                  <SignalCellularAltIcon />
                </Link>
              </Box>
            </Tooltip>
          )}

          {isPlatformAdmin && (
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
          )}

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
                onClick={async () => {
                  try {
                    setLastPublishedTitle("Checking for changes...");
                    const alteredFlow = await validateAndDiffFlow(flowId);
                    setAlteredNodes(
                      alteredFlow?.data.alteredNodes
                        ? alteredFlow.data.alteredNodes
                        : [],
                    );
                    setLastPublishedTitle(
                      alteredFlow?.data.alteredNodes
                        ? `Found changes to ${alteredFlow.data.alteredNodes.length} node(s)`
                        : alteredFlow?.data.message,
                    );
                    setValidationMessage(alteredFlow?.data.description);
                    setDialogOpen(true);
                  } catch (error) {
                    setLastPublishedTitle(
                      "Error checking for changes to publish",
                    );

                    if (error instanceof AxiosError) {
                      alert(error.response?.data?.error);
                    } else {
                      alert(
                        `Error checking for changes to publish. Confirm that your graph does not have any corrupted nodes and that all external portals are valid. \n${error}`,
                      );
                    }
                  }
                }}
              >
                CHECK FOR CHANGES TO PUBLISH
              </Button>
            </Badge>
            <Dialog
              open={dialogOpen}
              onClose={() => setDialogOpen(false)}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle style={{ paddingBottom: 0 }}>
                {lastPublishedTitle}
              </DialogTitle>
              <DialogContent>
                {alteredNodes?.length ? (
                  <>
                    <AlteredNodesSummaryContent
                      alteredNodes={alteredNodes}
                      url={props.url}
                    />
                    <Input
                      bordered
                      type="text"
                      name="summary"
                      value={summary || ""}
                      placeholder="Summarise your changes..."
                      onChange={(e) => setSummary(e.target.value)}
                    />
                  </>
                ) : validationMessage ? (
                  validationMessage
                ) : (
                  lastPublishedTitle
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDialogOpen(false)}>
                  KEEP EDITING
                </Button>
                <Button
                  color="primary"
                  onClick={async () => {
                    try {
                      setDialogOpen(false);
                      setLastPublishedTitle("Publishing changes...");
                      const { alteredNodes, message } = await publishFlow(
                        flowId,
                        summary,
                      );
                      setLastPublishedTitle(
                        alteredNodes
                          ? `Successfully published changes to ${alteredNodes.length} node(s)`
                          : `${message}` || "No new changes to publish",
                      );
                    } catch (error) {
                      setLastPublishedTitle("Error trying to publish");
                      alert(error);
                      console.log(error);
                    }
                  }}
                  disabled={!alteredNodes || alteredNodes.length === 0}
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
      {showDebugConsole && <DebugConsole />}
    </EmbeddedBrowser>
  );
});

export default PreviewBrowser;
