import { createFileRoute } from "@tanstack/react-router";
import PatternCatalog from "pages/GlobalSettings/Patterns";

export const Route = createFileRoute(
  "/_authenticated/app/global-settings/patterns",
)({
  component: PatternCatalog,
});
