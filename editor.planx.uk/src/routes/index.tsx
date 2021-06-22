import Cookies from "js-cookie";
import { lazy, map, mount, redirect, route } from "navi";
import * as React from "react";

import { client } from "../lib/graphql";
import Login from "../pages/Login";
import NetworkError from "../pages/NetworkError";
import { makeTitle } from "./utils";

type RoutingContext = {
  currentUser?: any;
};

const editorRoutes = mount({
  "/network-error": route({
    title: makeTitle("Network Error"),
    view: <NetworkError />,
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
    try {
      client.resetStore();
      Cookies.remove("jwt");
    } catch (err) {
      console.error(err);
    } finally {
      // hack to force-remove cookie on editor.planx.uk
      const cookieString = `jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = cookieString;
      document.cookie = cookieString.concat(" domain=.planx.uk;");

      window.location.href = "/";
    }
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
