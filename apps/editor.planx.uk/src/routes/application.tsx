import { compose, mount, route, withData } from "navi";
import React from "react";
import { makeTitle } from "./utils";
import Application from "../pages/Application/Application";

const applicationRoutes = compose(
  withData((req) => ({
    mountpath: req.mountpath,
  })),

  mount({
    "/": route(async (req) => {

      return {
        title: makeTitle("Your application"),
        view: (
          // need to create new component
          <Application />
        ),
      };
    }),
  }),
);

export default applicationRoutes;
