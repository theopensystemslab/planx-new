import { makeStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";
import React, { useEffect, useState } from "react";
import { ExternalLink, Globe,RefreshCw, Terminal } from "react-feather";

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
  const [resetPreview, setPreviewEnvironment] = useStore((state) => [
    state.resetPreview,
    state.setPreviewEnvironment,
  ]);
  const [key, setKey] = useState<boolean>(false);
  const classes = useStyles();

  useEffect(() => setPreviewEnvironment("editor"), []);

  return (
    <div id="fake-browser">
      <header>
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
          <Globe />
        </Tooltip>
      </header>
      <div className={classes.previewContainer}>
        <Questions key={String(key)} />
      </div>
      {showDebugConsole && <DebugConsole />}
    </div>
  );
});

export default PreviewBrowser;
