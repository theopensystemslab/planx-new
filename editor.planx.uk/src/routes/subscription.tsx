import { compose, mount, route, withData } from "navi";
import { Subscription } from "pages/FlowEditor/components/Subscription/Subscription";
import React from "react";

import { makeTitle } from "./utils";

const subscriptionRoutes = compose(
  withData((req) => ({
    mountpath: req.mountpath,
  })),

  mount({
    "/": compose(
      route(async (req) => {
        const { team: teamSlug } = req.params;

        return {
          title: makeTitle([teamSlug, "subscription"].join("/")),
          view: <Subscription />,
        };
      }),
    ),
  }),
);

export default subscriptionRoutes;
