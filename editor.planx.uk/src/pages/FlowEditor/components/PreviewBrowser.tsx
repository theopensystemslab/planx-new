import React, { useRef, useState } from "react";
import ExternalLink from "react-feather/dist/icons/external-link";
import RefreshCw from "react-feather/dist/icons/refresh-cw";
import Terminal from "react-feather/dist/icons/terminal";

const DebugConsole = () => {
  return <div>DebugConsole</div>;
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
      <iframe src={props.url} frameBorder="none" title="Preview" ref={ref} />
      {showDebugConsole && <DebugConsole />}
    </div>
  );
});

export default PreviewBrowser;
