import { compose, mount, route, withData } from "navi";
import ServiceSettings from "pages/FlowEditor/components/Settings/ServiceSettings";
import { useStore } from "pages/FlowEditor/lib/store";

import { makeTitle } from "./utils";

const { flowSlug, teamSlug, getFlowSettings } = useStore.getState();

const serviceSettingsRoutes = compose(
  withData((req) => ({
    mountpath: req.mountpath,
    flow: req.params.flow.split(",")[0],
  })),

  mount({
    "/": compose(
      route(async (req) => ({
        getData: await getFlowSettings(flowSlug, teamSlug),
        title: makeTitle(
          [req.params.team, req.params.flow, "service"].join("/"),
        ),
        view: ServiceSettings,
      })),
    ),
  }),
);

export default serviceSettingsRoutes;
