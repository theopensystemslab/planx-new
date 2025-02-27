import { compose, mount, route, withData } from "navi";
import Submissions from "pages/FlowEditor/components/Settings/Submissions/Submissions";
import React from "react";

import { makeTitle } from "./utils";

const serviceSubmissionRoutes = compose(
  withData((req) => ({
    mountpath: req.mountpath,
    flow: req.params.flow,
  })),

  mount({
    "/": compose(
      route(async (req) => {
        const { team: teamSlug, flow: flowSlug } = req.params;

        return {
          title: makeTitle([teamSlug, flowSlug, "submissions-log"].join("/")),
          view: <Submissions flowSlug={flowSlug} />,
        };
      }),
    ),
  }),
);

export default serviceSubmissionRoutes;
