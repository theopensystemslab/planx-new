import { compose, mount, route, withData } from "navi";
import ServiceSettings from "pages/FlowEditor/components/Settings/ServiceSettings";

import { makeTitle } from "./utils";

const serviceSettingsRoutes = compose(
  withData((req) => ({
    mountpath: req.mountpath,
    flow: req.params.flow.split(",")[0],
  })),

  mount({
    "/": compose(
      route(async (req) => ({
        title: makeTitle(
          [req.params.team, req.params.flow, "service"].join("/"),
        ),
        view: ServiceSettings,
      })),
    ),
  }),
);

export default serviceSettingsRoutes;
