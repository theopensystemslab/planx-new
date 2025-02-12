import { compose, mount, route, withData } from "navi";
import Submissions from "pages/FlowEditor/components/Settings/Submissions";
import React from "react";

import { makeTitle } from "./utils";

const submissionsLogRoutes = compose(
  withData((req) => ({
    mountpath: req.mountpath,
  })),

  mount({
    "/": compose(
      route(async (req) => {
        const { team: teamSlug } = req.params;

        return {
          title: makeTitle([teamSlug, "submissions-log"].join("/")),
          view: Submissions,
        };
      }),
    ),
    "/:flow": compose(
      route(async (req) => {
        const { team: teamSlug, flow: flowSlug } = req.params;

        return {
          title: makeTitle([teamSlug, "submissions-log", flowSlug].join("/")),
          view: <Submissions flowSlug={flowSlug} />,
        };
      }),
    ),
  }),
);

export default submissionsLogRoutes;
