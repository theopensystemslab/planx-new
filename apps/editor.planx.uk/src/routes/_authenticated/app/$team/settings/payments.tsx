import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import type { StripeConnectError } from "lib/api/stripe/types";
import PaymentSettings from "pages/FlowEditor/components/Settings/Team/Payment";
import { editorPageTitle } from "utils/pageTitle";
import { z } from "zod";

import { getStripeConnectResult } from "./-payments.utils";

export const paymentsSearchSchema = z.object({
  stripeConnected: z.boolean().optional(),
  stripeError: z
    .custom<StripeConnectError>((val) => typeof val === "string")
    .optional(),
});

export type PaymentsSearch = z.infer<typeof paymentsSearchSchema>;

export const Route = createFileRoute(
  "/_authenticated/app/$team/settings/payments",
)({
  validateSearch: zodValidator(paymentsSearchSchema),
  loaderDeps: ({ search }) => ({
    stripeConnected: search.stripeConnected,
    stripeError: search.stripeError,
  }),
  loader: ({ deps }) => getStripeConnectResult(deps),
  component: PaymentSettings,
  head: ({ match }) =>
    editorPageTitle("Payments", "Team settings", match.context.team.name),
});
