import { compose, mount, route, withData } from "navi";
import Submissions from "pages/FlowEditor/components/Settings/Submissions";

import { makeTitle } from "./utils";

const submissionsLogRoutes = compose(
  withData((req) => ({
    mountpath: req.mountpath,
    flow: req.params.flow.split(",")[0],
  })),

  mount({
    "/": compose(
      route(async (req) => ({
        title: makeTitle(
          [req.params.team, req.params.flow, "submissions-log"].join("/"),
        ),
        view: Submissions,
      })),
    ),
  }),
);

export default submissionsLogRoutes;
