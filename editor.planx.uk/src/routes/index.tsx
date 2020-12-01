import Cookies from "js-cookie";
import { lazy, map, mount, redirect, route } from "navi";
import * as React from "react";

import { client } from "../lib/graphql";
import Login from "../pages/Login";
import { makeTitle } from "./utils";

type RoutingContext = {
  currentUser?: any;
};

const editorRoutes = mount({
  "/network-error": route({
    title: makeTitle("Network Error"),
    view: <h1>Network error :(</h1>,
  }),

  "/login": map(async (req, context: RoutingContext) =>
    context.currentUser
      ? redirect(
          req.params.redirectTo
            ? decodeURIComponent(req.params.redirectTo)
            : "/"
        )
      : route({
          title: makeTitle("Login"),
          view: <Login />,
        })
  ),

  "/logout": map((): any => {
    client.resetStore();
    localStorage.removeItem("jwt");
    Cookies.remove("jwt", {
      domain: process.env.NODE_ENV === "production" ? ".planx.uk" : "localhost",
    });
    window.location.href = "/";
  }),

  "*": map(async (req, context: RoutingContext) =>
    context.currentUser
      ? lazy(() => import("./authenticated"))
      : redirect(`/login/?redirectTo=${encodeURIComponent(req.originalUrl)}`, {
          exact: false,
        })
  ),
});

export default mount({
  "/:team/:flow/preview": lazy(() => import("./preview")),
  "*": editorRoutes,
});
