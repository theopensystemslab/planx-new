import React, { useRef, useState } from "react";
import ExternalLink from "react-feather/dist/icons/external-link";
import RefreshCw from "react-feather/dist/icons/refresh-cw";
import Terminal from "react-feather/dist/icons/terminal";
import Preview from "../../Preview";
import { useStore } from "../lib/store";

const DebugTable = ({ ob }) => (
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
  return (
    <div style={{ overflow: "auto", padding: 20, maxHeight: "50%" }}>
      <DebugTable ob={passport.data} />
    </div>
  );
};

const PreviewBrowser: React.FC<{ url: string }> = React.memo((props) => {
  const ref = useRef(null);
  const [showDebugConsole, setDebugConsoleVisibility] = useState(false);

  return (
    <div id="fake-browser">
      <header>
        <input type="text" disabled value={props.url} />
        <RefreshCw
          onClick={() => ref.current.contentDocument.location.reload()}
        />
        <Terminal
          onClick={() => setDebugConsoleVisibility(!showDebugConsole)}
        />
        <a
          href={props.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit" }}
        >
          <ExternalLink />
        </a>
      </header>
      <div style={{ overflow: "auto", flex: 1, background: "#fff" }}>
        <Preview embedded />
      </div>
      {/* <iframe src={props.url} frameBorder="none" title="Preview" ref={ref} /> */}
      {showDebugConsole && <DebugConsole />}
    </div>
  );
});

export default PreviewBrowser;
