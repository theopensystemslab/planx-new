import { compose, map, mount, route, withData, withHead, withView } from "navi";
import ApplicationViewer from "pages/Preview/ApplicationViewer";
import ContentPage from "pages/Preview/ContentPage";
import Questions from "pages/Preview/Questions";
import ApplicationViewer from "pages/Preview/ViewApplication";
import React from "react";

import { draftView } from "./views/draft";

const routes = compose(
  withData(async (req) => ({
    mountpath: req.mountpath,
  })),

  withHead([
    <meta name="robots" content="noindex, nofollow" key="meta-robots" />,
    <meta name="googlebot" content="noindex, nofollow" key="meta-googlebot" />
  ]),

  withView(async (req) => await draftView(req)),

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
    "/view-application": route({
      view: <ApplicationViewer />,
      data: { isViewApplicationPage: true },
    }),
  }),
);

export default routes;
