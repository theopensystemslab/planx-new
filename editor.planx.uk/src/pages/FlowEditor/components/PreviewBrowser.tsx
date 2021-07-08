import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
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
  const [passport, breadcrumbs] = useStore((state) => [
    state.computePassport(),
    state.breadcrumbs,
  ]);
  const classes = useStyles();
  return (
    <div className={classes.console}>
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
  ] = useStore((state) => [
    state.id,
    state.resetPreview,
    state.setPreviewEnvironment,
    state.publishFlow,
    state.lastPublished,
    state.lastPublisher,
  ]);
  const [key, setKey] = useState<boolean>(false);
  const [lastPublishedTitle, setLastPublishedTitle] = useState<string>();
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
          <input type="text" disabled value={props.url} />
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

          <Tooltip arrow title="Open service preview">
            <a
              href={props.url}
              target="_blank"
              rel="noopener noreferrer"
              className={classes.refreshButton}
            >
              <ExternalLink />
            </a>
          </Tooltip>

          <Tooltip arrow title="Open published service">
            <a
              href={props.url.replace("/preview", "/published")}
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
                const publishedFlow = await publishFlow(flowId);
                setLastPublishedTitle("Successfully published");
              }}
            >
              PUBLISH
            </Button>
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
