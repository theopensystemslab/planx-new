import { compose, map, mount, route, withData, withView } from "navi";
import { VerifySubmissionEmail } from "pages/SubmissionDownload/VerifySubmissionEmail";
import React from "react";

import { makeTitle, validateTeamRoute } from "./utils";
import standaloneView from "./views/standalone";

const routes = compose(
  withData(async (req) => ({
    mountpath: req.mountpath,
  })),

  withView(async (req) => {
    await validateTeamRoute(req);
    return await standaloneView(req);
  }),

  mount({
    "/": map((req) => {
      return route({
        title: makeTitle("Download application"),
        view: <VerifySubmissionEmail params={req.params} />,
      });
    }),
  }),
);

export default routes;
