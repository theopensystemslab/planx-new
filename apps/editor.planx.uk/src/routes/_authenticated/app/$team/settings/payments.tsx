import { createFileRoute, redirect } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { hasFeatureFlag } from "lib/featureFlags";
import PaymentSettings from "pages/FlowEditor/components/Settings/Team/Payment";
import { z } from "zod";

export const paymentsSearchSchema = z.object({
  stripeConnected: z.boolean().optional(),
  stripeError: z.string().optional(),
});

export type PaymentsSearch = z.infer<typeof paymentsSearchSchema>;

export const Route = createFileRoute(
  "/_authenticated/app/$team/settings/payments",
)({
  beforeLoad: ({ params }) => {
    if (!hasFeatureFlag("STRIPE_MIGRATION")) {
      throw redirect({
        to: "/app/$team/settings",
        params: { team: params.team },
        replace: true,
      });
    }
  },
  validateSearch: zodValidator(paymentsSearchSchema),
  component: PaymentSettings,
});
