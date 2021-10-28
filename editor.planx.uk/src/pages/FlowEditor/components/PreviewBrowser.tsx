import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { makeStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import React, { useEffect, useState } from "react";
import { ExternalLink, Globe, RefreshCw, Terminal } from "react-feather";
import { useAsync } from "react-use";

import Questions from "../../Preview/Questions";
import { useStore } from "../lib/store";

const useStyles = makeStyles((theme) => ({
  console: {
    overflow: "auto",
    padding: 20,
    maxHeight: "50%",
  },
  previewContainer: {
    overflow: "auto",
    flex: 1,
    background: "#fff",
    paddingTop: theme.spacing(3),
  },
  refreshButton: {
    color: "inherit",
  },
  header: {
    display: "flex",
    flexDirection: "column",
  },
  publishButton: {
    width: "100%",
  },
}));

const DebugConsole = () => {
  const [passport, breadcrumbs, flowId] = useStore((state) => [
    state.computePassport(),
    state.breadcrumbs,
    state.id,
  ]);
  const classes = useStyles();
  return (
    <div className={classes.console}>
      <Typography variant="body2">
        <a
          href={`${process.env.REACT_APP_API_URL}/flows/${flowId}/download-schema`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Download the flow schema
        </a>
      </Typography>
      <pre>{JSON.stringify({ passport, breadcrumbs }, null, 2)}</pre>
    </div>
  );
};

const PreviewBrowser: React.FC<{ url: string }> = React.memo((props) => {
  const [showDebugConsole, setDebugConsoleVisibility] = useState(false);
  const [
    flowId,
    resetPreview,
    setPreviewEnvironment,
    publishFlow,
    lastPublished,
    lastPublisher,
    diffFlow,
  ] = useStore((state) => [
    state.id,
    state.resetPreview,
    state.setPreviewEnvironment,
    state.publishFlow,
    state.lastPublished,
    state.lastPublisher,
    state.diffFlow,
  ]);
  const [key, setKey] = useState<boolean>(false);
  const [lastPublishedTitle, setLastPublishedTitle] = useState<string>(
    "This flow is not published yet"
  );
  const [alteredNodes, setAlteredNodes] = useState<object[]>();
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const classes = useStyles();

  useEffect(() => setPreviewEnvironment("editor"), []);

  const formatLastPublish = (date: string, user: string) =>
    `Last published ${formatDistanceToNow(new Date(date))} ago by ${user}`;

  const lastPublishedRequest = useAsync(async () => {
    const date = await lastPublished(flowId);
    const user = await lastPublisher(flowId);

    setLastPublishedTitle(formatLastPublish(date, user));
  });

  return (
    <div id="fake-browser">
      <header className={classes.header}>
        <Box width="100%" display="flex">
          <input
            type="text"
            disabled
            value={props.url.replace("/preview", "/unpublished")}
          />
          <Tooltip arrow title="Refresh preview">
            <RefreshCw
              onClick={() => {
                resetPreview();
                setKey((a) => !a);
              }}
            />
          </Tooltip>

          <Tooltip arrow title="Toggle debug console">
            <Terminal
              onClick={() => setDebugConsoleVisibility(!showDebugConsole)}
            />
          </Tooltip>

          <Tooltip arrow title="Open editor preview">
            <a
              href={props.url.replace("/preview", "/unpublished")}
              target="_blank"
              rel="noopener noreferrer"
              className={classes.refreshButton}
            >
              <ExternalLink />
            </a>
          </Tooltip>

          <Tooltip arrow title="Open published service">
            <a
              href={props.url}
              target="_blank"
              rel="noopener noreferrer"
              className={classes.refreshButton}
            >
              <Globe />
            </a>
          </Tooltip>
        </Box>
        <Box width="100%" mt={2}>
          <Box display="flex" flexDirection="column" alignItems="flex-end">
            <Button
              className={classes.publishButton}
              variant="contained"
              color="primary"
              onClick={async () => {
                setLastPublishedTitle("Checking for changes...");
                const alteredFlow = await diffFlow(flowId);
                setLastPublishedTitle(
                  alteredFlow?.data.alteredNodes
                    ? `Found changes to ${alteredFlow?.data.alteredNodes.length} node(s)`
                    : "No new changes to publish"
                );
                setDialogOpen(true);
              }}
            >
              CHECK FOR CHANGES TO PUBLISH
            </Button>
            <Dialog
              open={dialogOpen}
              onClose={() => setDialogOpen(false)}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">
                {lastPublishedTitle}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  {`List of changes here...`}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDialogOpen(false)}>
                  KEEP EDITING
                </Button>
                <Button
                  color="primary"
                  autoFocus
                  onClick={async () => {
                    setDialogOpen(false);
                    setLastPublishedTitle("Publishing changes...");
                    const publishedFlow = await publishFlow(flowId);
                    setLastPublishedTitle(
                      publishedFlow?.data.alteredNodes
                        ? `Successfully published changes to ${publishedFlow.data.alteredNodes.length} node(s)`
                        : "No new changes to publish"
                    );
                  }}
                  disabled={window.location.hostname.endsWith("planx.uk")}
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
      </header>
      <div className={classes.previewContainer}>
        <Questions key={String(key)} />
      </div>
      {showDebugConsole && <DebugConsole />}
    </div>
  );
});

export default PreviewBrowser;
