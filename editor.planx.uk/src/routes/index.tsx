import { lazy, map, mount, redirect, route } from "navi";
import * as React from "react";

import { client } from "../lib/graphql";
import ErrorPage from "../pages/ErrorPage";
import Login from "../pages/Login";
import { isPreviewOnlyDomain, makeTitle } from "./utils";

type RoutingContext = {
  currentUser?: any;
};

const editorRoutes = mount({
  "/network-error": route({
    title: makeTitle("Network Error"),
    view: <ErrorPage title="Network error" />,
  }),

  "/login": map(async (req, context: RoutingContext) =>
    context.currentUser
      ? redirect(
          req.params.redirectTo
            ? decodeURIComponent(req.params.redirectTo)
            : "/",
        )
      : route({
          title: makeTitle("Login"),
          view: <Login />,
        }),
  ),

  "/logout": map((): any => {
    try {
      client.resetStore();
    } catch (err) {
      console.error(err);
    } finally {
      const cookieString = `auth=; jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      // remove jwt cookie for non planx domains (netlify preview urls)
      document.cookie = cookieString;
      // remove jwt cookie for planx domains (staging and production)
      document.cookie = cookieString.concat(
        ` domain=.${window.location.host};`,
      );
      // redirect to editor landing page with no jwt cookie set
      window.location.href = "/";
    }
  }),

  "*": map(async (req, context: RoutingContext) =>
    context.currentUser
      ? lazy(() => import("./authenticated"))
      : redirect(`/login/?redirectTo=${encodeURIComponent(req.originalUrl)}`, {
          exact: false,
        }),
  ),
});

const mountPayRoutes = () =>
  map(async () => {
    return lazy(() => import("./pay"));
  });

export default isPreviewOnlyDomain
  ? mount({
      "/:team/:flow/preview": lazy(() => import("./preview")), // XXX: keeps old URL working, but only for the team listed in the domain.
      "/:flow": lazy(() => import("./preview")),
      "/:flow/pay": mountPayRoutes(),
      // XXX: We're not sure where to redirect `/` to so for now we'll just return the default 404
      // "/": redirect("somewhere?"),
    })
  : mount({
      "/:team/:flow/preview": lazy(() => import("./preview")), // loads published flow if exists, or current flow
      "/:team/:flow/unpublished": lazy(() => import("./unpublished")), // loads current flow
      "/:team/:flow/pay": mountPayRoutes(),
      "*": editorRoutes,
    });
