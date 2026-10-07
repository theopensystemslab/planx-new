import { createFileRoute } from "@tanstack/react-router";
import { Permissions } from "pages/Permissions";

export const Route = createFileRoute("/_authenticated/app/permissions")({
  staticData: { pageTitle: "Permissions" },
  component: Permissions,
});
