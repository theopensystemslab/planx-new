import { compose, mount, NotFoundError, route, withData } from "navi";
import { useStore } from "pages/FlowEditor/lib/store";
import { ReadMePage } from "pages/FlowEditor/ReadMePage/ReadMePage";
import React from "react";

import { makeTitle } from "./utils";

const readMePageRoutes = compose(
  withData((req) => ({
    mountpath: req.mountpath,
    flow: req.params.flow.split(",")[0],
  })),

  mount({
    "/": route(async (req) => {
      const { team: teamSlug } = req.params;

      const isAuthorised = useStore.getState().canUserEditTeam(teamSlug);
      if (!isAuthorised)
        throw new NotFoundError(
          `User does not have access to ${req.originalUrl}`,
        );

      return {
        title: makeTitle("About this page"),
        view: <ReadMePage />,
      };
    }),
  }),
);

export default readMePageRoutes;
