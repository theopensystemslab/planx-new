import Cookies from "js-cookie";
import { compose, lazy, map, mount, redirect, route } from "navi";
import * as React from "react";
import { client } from "../lib/graphql";
import Login from "../pages/Login";
import { makeTitle } from "./utils";

type RoutingContext = {
  currentUser?: any;
};

export default compose(
  mount({
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

    "/logout": map(async (req, context: RoutingContext) => {
      // context.gqlClient.resetStore();
      document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      Cookies.remove("jwt");
      client.resetStore();
      window.location.href = "/";
      // never actually called
      return redirect("/");
    }),

    "*": map(async (req, context: RoutingContext) =>
      context.currentUser
        ? lazy(() => import("./authenticated"))
        : redirect(
            `/login/?redirectTo=${encodeURIComponent(req.originalUrl)}`,
            { exact: false }
          )
    ),
  })
);
