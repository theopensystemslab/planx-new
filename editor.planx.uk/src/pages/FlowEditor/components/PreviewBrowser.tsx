import LanguageIcon from "@mui/icons-material/Language";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import OpenInNewOffIcon from "@mui/icons-material/OpenInNewOff";
import RefreshIcon from "@mui/icons-material/Refresh";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { AxiosError } from "axios";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import React, { useState } from "react";
import { useAsync } from "react-use";
import Input from "ui/shared/Input";

import Questions from "../../Preview/Questions";
import { useStore } from "../lib/store";

const Console = styled(Box)(() => ({
  overflow: "auto",
  padding: 20,
  maxHeight: "50%",
}));

const PreviewContainer = styled(Box)(() => ({
  overflow: "auto",
  flex: 1,
  background: "#fff",
}));

const Header = styled("header")(() => ({
  display: "flex",
  flexDirection: "column",
}));

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

interface AlteredNodesSummary {
  title: string;
  portals: string[];
  updated: number;
  deleted: number;
}

function AlteredNodesSummaryContent(props: any) {
  const { alteredNodes, url } = props;

  const changeSummary: AlteredNodesSummary = {
    title: "",
    portals: [],
    updated: 0,
    deleted: 0,
  };

  alteredNodes.map((node: any) => {
    if (node.id === "0") {
      changeSummary["title"] =
        "You are publishing the main service for the first time.";
    } else if (node.id && Object.keys(node).length === 1) {
      changeSummary["deleted"] += 1;
    } else if (node.type === TYPES.InternalPortal) {
      if (node.data?.text?.includes("/")) {
        changeSummary["portals"].push(node.data?.text);
      }
    } else if (node.type) {
      changeSummary["updated"] += 1;
    }

    return changeSummary;
  });

  return (
    <Box pb={2}>
      {changeSummary["title"] && (
        <Typography variant="body2">{changeSummary["title"]}</Typography>
      )}
      {(changeSummary["updated"] > 0 || changeSummary["deleted"] > 0) && (
        <ul>
          <li key={"updated"}>
            <Typography variant="body2">{`${changeSummary["updated"]} nodes have been updated or added`}</Typography>
          </li>
          <li key={"deleted"}>
            <Typography variant="body2">{`${changeSummary["deleted"]} nodes have been deleted`}</Typography>
          </li>
        </ul>
      )}
      {changeSummary["portals"].length > 0 && (
        <>
          <Typography variant="body2">{`This includes recently published changes in the following nested services:`}</Typography>
          <ul>
            {changeSummary["portals"].map((portal, i) => (
              <li key={i}>
                {useStore.getState().canUserEditTeam(portal.split("/")[0]) ? (
                  <Link href={`../${portal}`} target="_blank">
                    <Typography variant="body2">{portal}</Typography>
                  </Link>
                ) : (
                  <Typography variant="body2">{portal}</Typography>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
      <Typography variant="body2">
        {`Review changes before publishing `}
        <Link
          href={url.replace("/preview", "/publish-preview")}
          target="_blank"
        >
          {`here`}
        </Link>
        {` (opens in a new tab)`}
      </Typography>
    </Box>
  );
}

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
  const [alteredNodes, setAlteredNodes] = useState<object[]>();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [summary, setSummary] = useState<string>();

  const formatLastPublish = (date: string, user: string) =>
    `Last published ${formatDistanceToNow(new Date(date))} ago by ${user}`;

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
    <Box id="embedded-browser">
      <Header>
        <Box width="100%" display="flex">
          <input
            type="text"
            disabled
            value={props.url.replace("/preview", "/publish-preview")}
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
            <Tooltip arrow title="Open unpublished service">
              <Link
                href={props.url.replace("/preview", "/unpublished")}
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
              >
                <OpenInNewOffIcon />
              </Link>
            </Tooltip>
          )}

          <Tooltip arrow title="Open preview of published service">
            <Link
              href={props.url.replace("/preview", "/publish-preview")}
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
      <PreviewContainer>
        <Questions previewEnvironment="editor" key={String(key)} />
      </PreviewContainer>
      {showDebugConsole && <DebugConsole />}
    </Box>
  );
});

export default PreviewBrowser;
