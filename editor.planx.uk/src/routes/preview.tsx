import { compose, map, mount, route, withData, withView } from "navi";
import ContentPage from "pages/Preview/ContentPage";
import Questions from "pages/Preview/Questions";
import React from "react";

import { getTeamFromDomain, validateTeamRoute } from "./utils";
import { previewView } from "./views/preview";

const routes = compose(
  withData(async (req) => {
    const externalDomainTeam = await getTeamFromDomain(
      window.location.hostname
    );

    return {
      mountpath: req.mountpath,
      team: req.params.team || externalDomainTeam,
      isPreviewOnlyDomain: Boolean(externalDomainTeam),
    };
  }),

  withView(async (req) => {
    await validateTeamRoute(req);
    return await previewView(req);
  }),

  mount({
    "/": route({
      view: <Questions previewEnvironment="standalone" />,
    }),
    "/pages/:page": map((req) => {
      return route({
        view: () => <ContentPage page={req.params.page} />,
        data: { isContentPage: true },
      });
    }),
  })
);

export default routes;
