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
    localStorage.clear();
    deleteAllCookies();
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

// https://stackoverflow.com/a/33366171/1456173
function deleteAllCookies() {
  var cookies = document.cookie.split("; ");
  for (var c = 0; c < cookies.length; c++) {
    var d = window.location.hostname.split(".");
    while (d.length > 0) {
      var cookieBase =
        encodeURIComponent(cookies[c].split(";")[0].split("=")[0]) +
        "=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=" +
        d.join(".") +
        " ;path=";
      var p = location.pathname.split("/");
      document.cookie = cookieBase + "/";
      while (p.length > 0) {
        document.cookie = cookieBase + p.join("/");
        p.pop();
      }
      d.shift();
    }
  }
}
