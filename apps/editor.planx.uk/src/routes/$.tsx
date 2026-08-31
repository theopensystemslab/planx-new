import { createFileRoute } from "@tanstack/react-router";
import { CatchAllComponent } from "pages/ErrorPage/CatchAllComponent";

export const Route = createFileRoute("/$")({
  component: CatchAllComponent,
});
