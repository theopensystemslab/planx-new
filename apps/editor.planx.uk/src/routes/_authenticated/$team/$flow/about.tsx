import { createFileRoute } from "@tanstack/react-router";
import About from "pages/FlowEditor/components/Settings/Flow/About";

export const Route = createFileRoute("/_authenticated/$team/$flow/about")({
  component: About,
});
