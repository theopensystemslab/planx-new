import { compose, map, mount, route, withData, withView } from "navi";
import { useStore } from "pages/FlowEditor/lib/store";
import { OfflinePage } from "pages/OfflinePage";
import ContentPage from "pages/Preview/ContentPage";
import Questions from "pages/Preview/Questions";
import React from "react";

import { getTeamFromDomain, validateTeamRoute } from "./utils";
import { publishedView } from "./views/published";

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
      view: () => {
        const isOnline = useStore.getState().flowStatus === "online";

        return isOnline ? (
          <Questions previewEnvironment="standalone" />
        ) : (
          <OfflinePage />
        );
      },
    }),
    "/pages/:page": map((req) => {
      return route({
        view: () => <ContentPage page={req.params.page} />,
        data: { isContentPage: true },
      });
    }),
  }),
);

export default routes;
