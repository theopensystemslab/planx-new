import { compose, mount, redirect, route, withData, withView } from "navi";
import About from "pages/FlowEditor/components/Settings/Flow/About";
import Disclaimers from "pages/FlowEditor/components/Settings/Flow/Disclaimers";
import Help from "pages/FlowEditor/components/Settings/Flow/Help";
import FlowSettingsLayout from "pages/FlowEditor/components/Settings/Flow/Layout";
import Privacy from "pages/FlowEditor/components/Settings/Flow/Privacy";
import Template from "pages/FlowEditor/components/Settings/Flow/Template";
import Visibility from "pages/FlowEditor/components/Settings/Flow/Visibility";
import React from "react";
import { View } from "react-navi";

import { makeTitle } from "./utils";

const flowNewSettingsRoutes = compose(
  withData((req) => ({
    mountpath: req.mountpath,
    flow: req.params.flow.split(",")[0],
  })),

  withView(() => (
    <FlowSettingsLayout>
      <View />
    </FlowSettingsLayout>
  )),

  mount({
    "/": redirect("./visibility"),
    "/visibility": route((req) => ({
      title: makeTitle(
        [req.params.team, req.params.flow, "settings", "visibility"].join("/"),
      ),
      view: <Visibility />,
    })),
    "/about": route((req) => ({
      title: makeTitle(
        [req.params.team, req.params.flow, "settings", "about"].join("/"),
      ),
      view: <About />,
    })),
    "/disclaimers": route((req) => ({
      title: makeTitle(
        [req.params.team, req.params.flow, "settings", "disclaimers"].join("/"),
      ),
      view: <Disclaimers />,
    })),
    "/pages": mount({
      "/help": route((req) => ({
        title: makeTitle(
          [req.params.team, req.params.flow, "settings", "pages", "help"].join(
            "/",
          ),
        ),
        view: <Help />,
      })),
      "/privacy": route((req) => ({
        title: makeTitle(
          [
            req.params.team,
            req.params.flow,
            "settings",
            "pages",
            "privacy",
          ].join("/"),
        ),
        view: <Privacy />,
      })),
    }),
    "/templates": route((req) => ({
      title: makeTitle(
        [req.params.team, req.params.flow, "settings", "templates"].join("/"),
      ),
      view: <Template />,
    })),
  }),
);

export default flowNewSettingsRoutes;
