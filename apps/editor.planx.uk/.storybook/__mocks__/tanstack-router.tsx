import React from "react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import type { Decorator } from "@storybook/react";

export const tanstackRouterDecorator: Decorator = (Story) => {
  const rootRoute = createRootRoute({
    component: () => <Outlet />,
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: Story,
  });

  const routeTree = rootRoute.addChildren([indexRoute]);

  const history = createMemoryHistory({ initialEntries: ["/"] });

  const router = createRouter({ routeTree, history, defaultPendingMs: 0 });

  return <RouterProvider router={router} />;
};
