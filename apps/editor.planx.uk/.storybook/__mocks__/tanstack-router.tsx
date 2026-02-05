import type { Decorator } from "@storybook/react";
import {
  RouterProvider,
  createRootRoute,
  createRouter,
  createMemoryHistory,
} from "@tanstack/react-router";
import React from "react";

export const tanstackRouterDecorator: Decorator = (Story, context) => {
  const { parameters } = context;

  const mockParams = parameters?.tanstackRouter?.params || {};
  const mockLocation = parameters?.tanstackRouter?.location || {
    pathname: "/",
    search: "",
    hash: "",
  };
  const mockContext = parameters?.tanstackRouter?.context || {};

  const rootRoute = createRootRoute({
    component: () => <Story />,
  });

  const memoryHistory = createMemoryHistory({
    initialEntries: [
      mockLocation.pathname + mockLocation.search + mockLocation.hash,
    ],
  });

  const router = createRouter({
    routeTree: rootRoute,
    history: memoryHistory,
    context: mockContext,
    defaultPreload: false,
    notFoundMode: 'root',
  });

  return <RouterProvider router={router} />;
};
