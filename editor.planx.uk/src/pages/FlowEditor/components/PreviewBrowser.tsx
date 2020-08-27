import React, { useRef } from "react";
import ExternalLink from "react-feather/dist/icons/external-link";
import RefreshCw from "react-feather/dist/icons/refresh-cw";

const PreviewBrowser: React.FC<{ url: string }> = React.memo((props) => {
  const ref = useRef(null);

  return (
    <div id="fake-browser">
      <header>
        <input type="text" disabled value={props.url} />
        <RefreshCw
          onClick={() => ref.current.contentDocument.location.reload()}
        />
        <a href={props.url} target="_blank" rel="noopener noreferrer">
          <ExternalLink />
        </a>
      </header>
      <iframe src={props.url} frameBorder="none" title="Preview" ref={ref} />
    </div>
  );
});

export default PreviewBrowser;
