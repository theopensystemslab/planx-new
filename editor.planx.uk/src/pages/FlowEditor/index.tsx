import React, { useRef } from "react";
import { Link, useCurrentRoute } from "react-navi";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Flow from "./components/Flow";
import "./floweditor.scss";
import MuiLink from "@material-ui/core/Link";
import useScrollControlsAndRememberPosition from "./lib/useScrollControlsAndRememberPosition";
import "./components/Settings";

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

  const route = useCurrentRoute();

  const flowBaseRoute = `/${route.data.team}/${route.data.flow}`;

  return (
    <div id="editor-container">
      <div id="editor" className={classes.editor}>
        <MuiLink
          href={`${flowBaseRoute}/settings`}
          component={Link}
          className={classes.sideLink}
        >
          Settings
        </MuiLink>
        <Flow flow={flow} breadcrumbs={breadcrumbs} />
      </div>
    </div>
  );
};

export default FlowEditor;
