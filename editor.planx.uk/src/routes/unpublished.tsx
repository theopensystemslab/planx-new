import { compose, map, mount, route, withData, withView } from "navi";
import ContentPage from "pages/Preview/ContentPage";
import Questions from "pages/Preview/Questions";
import React from "react";

import { getTeamFromDomain } from "./utils";
import { unpublishedView } from "./views/unpublished";

const routes = compose(
  withData(async (req) => ({
    mountpath: req.mountpath,
    team:
      req.params.team || (await getTeamFromDomain(window.location.hostname)),
  })),

  withView(async (req) => await unpublishedView(req)),

  mount({
    "/": route({
      view: <Questions previewEnvironment="editor" />,
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
