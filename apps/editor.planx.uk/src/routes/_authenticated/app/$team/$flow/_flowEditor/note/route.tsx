import { createFileRoute, Outlet } from "@tanstack/react-router";
import React from "react";

export const Route = createFileRoute(
  "/_authenticated/app/$team/$flow/_flowEditor/note",
)({
  component: () => <Outlet />,
});
