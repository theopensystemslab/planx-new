import { compose, mount, redirect, route, withData, withView } from "navi";
import FlowHelpPageSettings from "pages/FlowEditor/components/NewSettings/FlowSettings/FlowHelpPageSettings";
import FlowLegalDisclaimerSettings from "pages/FlowEditor/components/NewSettings/FlowSettings/FlowLegalDisclaimerSettings";
import FlowSettingsLayout from "pages/FlowEditor/components/NewSettings/FlowSettings/FlowSettingsLayout";
import FlowTemplateSettings from "pages/FlowEditor/components/NewSettings/FlowSettings/FlowTemplateSettings";
import Privacy from "pages/FlowEditor/components/NewSettings/FlowSettings/Privacy";
import Visibility from "pages/FlowEditor/components/NewSettings/FlowSettings/Visibility";
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
        [req.params.team, req.params.flow, "new-settings", "visibility"].join(
          "/",
        ),
      ),
      view: <Visibility />,
    })),
    "/legal-disclaimer": route((req) => ({
      title: makeTitle(
        [
          req.params.team,
          req.params.flow,
          "new-settings",
          "legal-disclaimer",
        ].join("/"),
      ),
      view: <FlowLegalDisclaimerSettings />,
    })),
    "/pages": mount({
      "/help": route((req) => ({
        title: makeTitle(
          [
            req.params.team,
            req.params.flow,
            "new-settings",
            "pages",
            "help",
          ].join("/"),
        ),
        view: <FlowHelpPageSettings />,
      })),
      "/privacy": route((req) => ({
        title: makeTitle(
          [
            req.params.team,
            req.params.flow,
            "new-settings",
            "pages",
            "privacy",
          ].join("/"),
        ),
        view: <Privacy />,
      })),
    }),
    "/templates": route((req) => ({
      title: makeTitle(
        [req.params.team, req.params.flow, "new-settings", "templates"].join(
          "/",
        ),
      ),
      view: <FlowTemplateSettings />,
    })),
  }),
);

export default flowNewSettingsRoutes;
