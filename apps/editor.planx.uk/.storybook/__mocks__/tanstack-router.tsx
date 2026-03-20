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

  const mockLocation = parameters?.tanstackRouter?.location || {
    pathname: "/",
    search: "",
    hash: "",
  };
  const mockContext = parameters?.tanstackRouter?.context || {};

  const fullPath = `${mockLocation.pathname}${mockLocation.search || ""}${mockLocation.hash || ""}`;

  const memoryHistory = createMemoryHistory({
    initialEntries: [fullPath],
  });

  if (mockLocation.state) {
    memoryHistory.replace(fullPath, mockLocation.state);
  }

  const rootRoute = createRootRoute({
    component: () => <Story />,
  });

  const router = createRouter({
    routeTree: rootRoute,
    history: memoryHistory,
    context: mockContext,
    defaultPreload: false,
  });

  return <RouterProvider router={router} />;
};