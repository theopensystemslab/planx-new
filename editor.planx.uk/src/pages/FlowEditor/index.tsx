import { makeStyles, Theme } from "@material-ui/core/styles";
import React, { useRef } from "react";
import Flow from "./components/Flow";
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

  return (
    <div id="editor-container">
      <div id="editor" className={classes.editor}>
        <Flow flow={flow} breadcrumbs={breadcrumbs} />
      </div>
    </div>
  );
};

export default FlowEditor;
