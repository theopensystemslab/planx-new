import { compose, mount, route, withData } from "navi";
import Submissions from "pages/FlowEditor/components/Submissions/Submissions";
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
          title: makeTitle([teamSlug, "submissions"].join("/")),
          view: <Submissions />,
        };
      }),
    ),
  }),
);

export default submissionsLogRoutes;
