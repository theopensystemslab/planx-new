import {
  compose,
  map,
  mount,
  NotFoundError,
  redirect,
  route,
  withData,
} from "navi";
import DesignSettings from "pages/FlowEditor/components/Settings/DesignSettings";
import TeamSettings from "pages/FlowEditor/components/Settings/TeamSettings";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import Settings from "../pages/FlowEditor/components/Settings";
import { makeTitle } from "./utils";

const teamSettingsRoutes = compose(
  withData((req) => ({
    mountpath: req.mountpath,
  })),

  mount({
    "/": redirect("./team"),
    "/:tab": map(async (req) => {
      const isAuthorised = useStore.getState().canUserEditTeam(req.params.team);
      if (!isAuthorised)
        throw new NotFoundError(
          `User does not have access to ${req.originalUrl}`,
        );

      return route(async (req) => ({
        title: makeTitle([req.params.team, "Team Settings"].join("/")),
        view: (
          <Settings
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
          />
        ),
      }));
    }),
  }),
);

export default teamSettingsRoutes;
