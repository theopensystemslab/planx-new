import { compose, mount, route, withData } from "navi";
import SubmissionHTML from "pages/FlowEditor/components/Submissions/components/SubmissionHTML";
import Submissions from "pages/FlowEditor/components/Submissions/Submissions";
import React from "react";

import { makeTitle, withTeamAuth } from "./utils";

const submissionsLogRoutes = compose(
  withTeamAuth,

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

    "/:sessionId": compose(
      route(async (req) => {
        const { team: teamSlug, flow: flowSlug, sessionId } = req.params;

        return {
          title: makeTitle([teamSlug, flowSlug, "submission"].join("/")),
          view: <SubmissionHTML sessionId={sessionId} />,
        };
      }),
    ),
  }),
);

export default submissionsLogRoutes;
