import { createFileRoute, Outlet } from "@tanstack/react-router";
import React from "react";
import { publicLoader } from "routes/_public/-loader";

export const Route = createFileRoute("/_public/_customSubdomain/$flow")({
  loader: publicLoader,
  component: () => <Outlet />,
});
