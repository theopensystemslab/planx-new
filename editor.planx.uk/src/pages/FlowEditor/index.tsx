import "./components/Settings";
import "./floweditor.scss";

import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import React, { useRef } from "react";

import { rootFlowPath } from "../../routes/utils";
import Flow from "./components/Flow";
import PreviewBrowser from "./components/PreviewBrowser";
import { useStore } from "./lib/store";
import useScrollControlsAndRememberPosition from "./lib/useScrollControlsAndRememberPosition";

const useStyles = makeStyles((theme: Theme) => ({
  editor: {
    position: "relative",
  },
  sideLink: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

const FlowEditor: React.FC<any> = ({ flow, breadcrumbs }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useScrollControlsAndRememberPosition(scrollContainerRef);

  const showPreview = useStore((state) => state.showPreview);

  const classes = useStyles();

  return (
    <div id="editor-container">
      <div id="editor" className={classes.editor} ref={scrollContainerRef}>
        <Flow flow={flow} breadcrumbs={breadcrumbs} />
      </div>
      {showPreview && (
        <PreviewBrowser
          url={`${window.location.origin}${rootFlowPath(false)}/preview`}
        />
      )}
    </div>
  );
};

export default FlowEditor;
