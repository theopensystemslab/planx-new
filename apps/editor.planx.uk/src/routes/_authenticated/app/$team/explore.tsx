import { createFileRoute, notFound } from "@tanstack/react-router";
import Explore from "pages/Explore";

export const Route = createFileRoute("/_authenticated/app/$team/explore")({
  staticData: { pageTitle: "Explore" },
  beforeLoad: ({ context }) => {
    const isAuthorised = Boolean(context.role);
    if (!isAuthorised) {
      throw notFound();
    }
  },
  component: Explore,
});
