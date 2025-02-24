import { compose, mount, route, withData } from "navi";
import Submissions from "pages/FlowEditor/components/Settings/Submissions/Submissions";
import React from "react";

import { makeTitle } from "./utils";

const submissionsLogRoutes = compose(
  withData((req) => ({
    mountpath: req.mountpath,
  })),

  mount({
    "/": compose(
      route(async (req) => {
        const { team: teamSlug, flow: flowId } = req.params;

        return {
          title: makeTitle([teamSlug, "submissions-log"].join("/")),
          view: <Submissions flowId={flowId} />,
        };
      }),
    ),
  }),
);

export default submissionsLogRoutes;
