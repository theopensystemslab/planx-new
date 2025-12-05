import { compose, map, mount, route, withData, withView } from "navi";
import ContentPage from "pages/Preview/ContentPage";
import Questions from "pages/Preview/Questions";
import ApplicationViewer from "pages/Preview/ViewApplication";
import React from "react";

import { getTeamFromDomain, validateTeamRoute } from "./utils";
import { publishedView } from "./views/published/publishedView";

const routes = compose(
  withData(async (req) => {
    const externalDomainTeam = await getTeamFromDomain(
      window.location.hostname,
    );

    return {
      mountpath: req.mountpath,
      isPreviewOnlyDomain: Boolean(externalDomainTeam),
    };
  }),

  withView(async (req) => {
    await validateTeamRoute(req);
    return await publishedView(req);
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
    "/view-application": route({
      view: <ApplicationViewer />,
      data: { isViewApplicationPage: true },
    }),
  }),
);

export default routes;
