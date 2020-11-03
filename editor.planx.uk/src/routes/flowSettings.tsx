import { compose, mount, redirect, route, withData } from "navi";
import React from "react";

import FlowSettings from "../pages/FlowEditor/components/Settings";
import { makeTitle } from "./utils";

const flowSettingsRoutes = compose(
  withData((req) => ({
    mountpath: req.mountpath,
  })),

  mount({
    "/": redirect("./team"),
    "/:tab": route((req) => ({
      title: makeTitle(
        [req.params.team, req.params.flow, "Settings"].join("/")
      ),
      view: <FlowSettings tab={req.params.tab} />,
    })),
  })
);

export default flowSettingsRoutes;
