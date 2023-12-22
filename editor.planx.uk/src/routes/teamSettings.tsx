
import { compose, mount, redirect, route, withData } from "navi";
import DesignSettings from "pages/FlowEditor/components/Settings/DesignSettings";
import TeamSettings from "pages/FlowEditor/components/Settings/TeamSettings";
import React from "react";

import Settings from "../pages/FlowEditor/components/Settings";
import { makeTitle } from "./utils";

const flowSettingsRoutes = compose(
  withData((req) => ({
    mountpath: req.mountpath
  })),

  mount({
    "/": redirect("./team"),
    "/:tab": route(async (req) => ({
        title: makeTitle(
          [req.params.team, "Team Settings"].join("/"),
        ),
        view: <Settings
          currentTab={req.params.tab}
          tabs={[
            {
              name: "Team",
              route: "team",
              Component: TeamSettings,
            },
            {
              name: "Design",
              route: "design",
              Component: DesignSettings,
            },
          ]}
          />,
      }))
  }),
);

export default flowSettingsRoutes;
