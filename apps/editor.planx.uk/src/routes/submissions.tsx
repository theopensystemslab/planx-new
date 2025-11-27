import { compose, mount, route, withData } from "navi";
import Submissions from "pages/FlowEditor/components/Submissions/Submissions";
import React from "react";

import { makeTitle } from "./utils";

const submissionsLogRoutes = compose(
  withData((req) => ({
    mountpath: req.mountpath,
  })),

  // TODO: checkout auth guard
  mount({
    "/": compose(
      route(async (req) => {
        const { team: teamSlug } = req.params;

        return {
          title: makeTitle([teamSlug, "submissions"].join("/")),
          view: <Submissions />,
        };
      }),
    ),

    "/:sessionId": compose(
      route(async (req) => {
        const { team: teamSlug, flow: flowSlug, sessionId } = req.params;

        return {
          title: makeTitle([teamSlug, flowSlug, "submission"].join("/")),
          view: `this is session ${sessionId}`,
        };
      }),
    ),
  }),
);

export default submissionsLogRoutes;
