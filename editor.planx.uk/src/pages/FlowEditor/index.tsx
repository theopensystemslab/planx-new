import { makeStyles, Theme } from "@material-ui/core/styles";
import React, { useEffect, useRef } from "react";
import { rootFlowPath } from "../../routes/utils";
import Flow from "./components/Flow";
import PreviewBrowser from "./components/PreviewBrowser";
import "./components/Settings";
import "./floweditor.scss";
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

  const classes = useStyles();

  const editorRef = useRef(null);

  useEffect(() => {
    console.log("mounted");
  }, []);

  return (
    <div id="editor-container">
      <div id="editor" className={classes.editor} ref={editorRef}>
        <Flow flow={flow} breadcrumbs={breadcrumbs} />
      </div>

      <PreviewBrowser
        url={`${window.location.origin}${rootFlowPath(false)}/preview`}
      />
    </div>
  );
};

export default FlowEditor;
