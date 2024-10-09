import { compose, lazy, map, mount, redirect, route, withView } from "navi";
import { loadingView } from "pages/layout/LoadingLayout";
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

const loadPayRoutes = () =>
  compose(
    withView(loadingView),
    lazy(() => import("./pay")),
  );

const loadPublishedRoutes = () =>
  compose(
    withView(loadingView),
    lazy(() => import("./published")),
  );

const loadPreviewRoutes = () =>
  compose(
    withView(loadingView),
    lazy(() => import("./preview")),
  );

const loadDraftRoutes = () =>
  compose(
    withView(loadingView),
    lazy(() => import("./draft")),
  );

export default isPreviewOnlyDomain
  ? mount({
      "/:team/:flow/published": loadPublishedRoutes(), // XXX: keeps old URL working, but only for the team listed in the domain.
      "/:flow": loadPublishedRoutes(),
      "/:flow/pay": loadPayRoutes(),
      // XXX: We're not sure where to redirect `/` to so for now we'll just return the default 404
      // "/": redirect("somewhere?"),
    })
  : mount({
      "/:team/:flow/published": loadPublishedRoutes(), // loads current published flow if exists, or throws Not Found if unpublished
      "/canterbury/find-out-if-you-need-planning-permission/preview": map(
        async (req) =>
          redirect(
            `/canterbury/find-out-if-you-need-planning-permission/published${req?.search}`,
          ),
      ), // temporary redirect while Canterbury works with internal IT to update advertised service links
      "/:team/:flow/preview": loadPreviewRoutes(), // loads current draft flow and latest published external portals, or throws Not Found if any external portal is unpublished
      "/:team/:flow/draft": loadDraftRoutes(), // loads current draft flow and draft external portals
      "/:team/:flow/pay": loadPayRoutes(),
      "*": editorRoutes,
    });
