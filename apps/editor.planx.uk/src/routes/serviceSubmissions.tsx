import { compose, mount, route, withData } from "navi";
import SubmissionHTML from "pages/FlowEditor/components/Submissions/components/SubmissionHTML";
import Submissions from "pages/FlowEditor/components/Submissions/Submissions";
import React from "react";

import { makeTitle, withTeamAuth } from "./utils";

const serviceSubmissionRoutes = compose(
  withTeamAuth,

  withData((req) => ({
    mountpath: req.mountpath,
    flow: req.params.flow,
  })),

  mount({
    "/": compose(
      route(async (req) => {
        const { team: teamSlug, flow: flowSlug } = req.params;

        return {
          title: makeTitle([teamSlug, flowSlug, "submissions"].join("/")),
          view: <Submissions flowSlug={flowSlug} />,
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

export default serviceSubmissionRoutes;
