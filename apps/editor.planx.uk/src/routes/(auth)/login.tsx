import { createFileRoute } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import Login from "pages/Login/Login";
import { z } from "zod";

const loginSearchSchema = z.object({
  redirectTo: z.string().optional(),
});

export const Route = createFileRoute("/(auth)/login")({
  validateSearch: loginSearchSchema,
  component: Login,
  pendingComponent: DelayedLoadingIndicator,
});
