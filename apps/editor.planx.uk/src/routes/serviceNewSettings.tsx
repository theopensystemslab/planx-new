import { compose, mount, redirect, route, withData } from "navi";
import FlowHelpPageSettings from "pages/FlowEditor/components/NewSettings/FlowSettings/FlowHelpPageSettings";
import FlowLegalDisclaimerSettings from "pages/FlowEditor/components/NewSettings/FlowSettings/FlowLegalDisclaimerSettings";
import FlowPrivacyPageSettings from "pages/FlowEditor/components/NewSettings/FlowSettings/FlowPrivacyPageSettings";
import FlowSettingsLayout from "pages/FlowEditor/components/NewSettings/FlowSettings/FlowSettingsLayout";
import FlowTemplateSettings from "pages/FlowEditor/components/NewSettings/FlowSettings/FlowTemplateSettings";
import FlowVisibilitySettings from "pages/FlowEditor/components/NewSettings/FlowSettings/FlowVisibilitySettings";
import React from "react";

import { makeTitle } from "./utils";

const flowNewSettingsRoutes = compose(
  withData((req) => ({
    mountpath: req.mountpath,
    flow: req.params.flow.split(",")[0],
  })),

  mount({
    "/": redirect("./visibility"),
    "/visibility": route((req) => ({
      title: makeTitle(
        [req.params.team, req.params.flow, "new-settings", "visibility"].join(
          "/",
        ),
      ),
      view: (
        <FlowSettingsLayout>
          <FlowVisibilitySettings />
        </FlowSettingsLayout>
      ),
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
      view: (
        <FlowSettingsLayout>
          <FlowLegalDisclaimerSettings />
        </FlowSettingsLayout>
      ),
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
        view: (
          <FlowSettingsLayout>
            <FlowHelpPageSettings />
          </FlowSettingsLayout>
        ),
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
        view: (
          <FlowSettingsLayout>
            <FlowPrivacyPageSettings />
          </FlowSettingsLayout>
        ),
      })),
    }),
    "/templates": route((req) => ({
      title: makeTitle(
        [req.params.team, req.params.flow, "new-settings", "templates"].join(
          "/",
        ),
      ),
      view: (
        <FlowSettingsLayout>
          <FlowTemplateSettings />
        </FlowSettingsLayout>
      ),
    })),
  }),
);

export default flowNewSettingsRoutes;
