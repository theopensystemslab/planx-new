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
  const [resetPreview, setPreviewEnvironment] = useStore((state) => [
    state.resetPreview,
    state.setPreviewEnvironment,
  ]);
  const [key, setKey] = useState<boolean>(false);
  const classes = useStyles();

  useEffect(() => setPreviewEnvironment("editor"), []);

  // XXX: temporarily hide publish button in production
  const showPublishButton = !window.location.hostname.endsWith("planx.uk");

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

          {showPublishButton ? (
            <>
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
            </>
          ) : (
            <Tooltip arrow title="Open editor preview">
              <a
                href={props.url}
                target="_blank"
                rel="noopener noreferrer"
                className={classes.refreshButton}
              >
                <ExternalLink />
              </a>
            </Tooltip>
          )}
        </Box>
        {showPublishButton && <PublishButton />}
      </header>
      <div className={classes.previewContainer}>
        <Questions key={String(key)} />
      </div>
      {showDebugConsole && <DebugConsole />}
    </div>
  );
});

const PublishButton: React.FC = () => {
  const [
    flowId,
    lastPublished,
    lastPublisher,
    publishFlow,
  ] = useStore((state) => [
    state.id,
    state.lastPublished,
    state.lastPublisher,
    state.publishFlow,
  ]);
  const [lastPublishedTitle, setLastPublishedTitle] = useState<string>();
  const classes = useStyles();

  const formatLastPublish = (date: string, user: string) =>
    `Last published ${formatDistanceToNow(new Date(date))} ago by ${user}`;

  useAsync(async () => {
    const date = await lastPublished(flowId);
    const user = await lastPublisher(flowId);
    setLastPublishedTitle(formatLastPublish(date, user));
  });

  return (
    <Box width="100%" mt={2}>
      <Box display="flex" flexDirection="column" alignItems="flex-end">
        <Button
          className={classes.publishButton}
          variant="contained"
          color="primary"
          onClick={async () => {
            await publishFlow(flowId);
            setLastPublishedTitle("Successfully published");
          }}
          disabled={window.location.hostname.endsWith("planx.uk")}
        >
          PUBLISH
        </Button>
        <Box mr={0}>
          <Typography variant="caption">{lastPublishedTitle}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default PreviewBrowser;
