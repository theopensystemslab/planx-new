import { makeStyles } from "@material-ui/core/styles";
import React, { useState } from "react";
import { ExternalLink, RefreshCw, Terminal } from "react-feather";

import Preview from "../../Preview";
import { useStore } from "../lib/store";

const useStyles = makeStyles(() => ({
  console: {
    overflow: "auto",
    padding: 20,
    maxHeight: "50%",
  },
  previewContainer: {
    overflow: "auto",
    flex: 1,
    background: "#fff",
  },
  refreshButton: {
    color: "inherit",
  },
}));

const DebugConsole = () => {
  const [passport, breadcrumbs] = useStore((state) => [
    state.passport,
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
  const resetPreview = useStore((state) => state.resetPreview);
  const [key, setKey] = useState<boolean>(false);
  const classes = useStyles();

  return (
    <div id="fake-browser">
      <header>
        <input type="text" disabled value={props.url} />
        <RefreshCw
          onClick={() => {
            resetPreview();
            setKey((a) => !a);
          }}
        />
        <Terminal
          onClick={() => setDebugConsoleVisibility(!showDebugConsole)}
        />
        <a
          href={props.url}
          target="_blank"
          rel="noopener noreferrer"
          className={classes.refreshButton}
        >
          <ExternalLink />
        </a>
      </header>
      <div className={classes.previewContainer}>
        <Preview key={String(key)} embedded />
      </div>
      {showDebugConsole && <DebugConsole />}
    </div>
  );
});

export default PreviewBrowser;
