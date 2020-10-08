import makeStyles from "@material-ui/core/styles/makeStyles";
import React, { useState } from "react";
import ExternalLink from "react-feather/dist/icons/external-link";
import RefreshCw from "react-feather/dist/icons/refresh-cw";
import Terminal from "react-feather/dist/icons/terminal";

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

const DebugTable = ({ ob = {} }) => (
  <table>
    {Object.keys(ob)
      .sort()
      .map((k) => (
        <tr key={k}>
          <th>{k}</th>
          <td>{JSON.stringify(ob[k]?.value)}</td>
        </tr>
      ))}
  </table>
);

const DebugConsole = () => {
  const passport = useStore((state) => state.passport);
  const classes = useStyles();
  return (
    <div className={classes.console}>
      <pre>{JSON.stringify(passport, null, 2)}</pre>
    </div>
  );
};

const PreviewBrowser: React.FC<{ url: string }> = React.memo((props) => {
  const [showDebugConsole, setDebugConsoleVisibility] = useState(false);
  const resetPreview = useStore((state) => state.resetPreview);
  const classes = useStyles();

  return (
    <div id="fake-browser">
      <header>
        <input type="text" disabled value={props.url} />
        <RefreshCw onClick={resetPreview} />
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
        <Preview embedded />
      </div>
      {showDebugConsole && <DebugConsole />}
    </div>
  );
});

export default PreviewBrowser;
