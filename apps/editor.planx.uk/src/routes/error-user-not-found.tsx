import { createFileRoute } from "@tanstack/react-router";
import UserNotFound from "pages/ErrorPage/UserNotFound";
import { z } from "zod";

const searchSchema = z.object({
  email: z.string().email().optional().catch(undefined),
});

export const Route = createFileRoute("/error-user-not-found")({
  validateSearch: searchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { email } = Route.useSearch();

  return <UserNotFound emailAddress={email} />;
}
