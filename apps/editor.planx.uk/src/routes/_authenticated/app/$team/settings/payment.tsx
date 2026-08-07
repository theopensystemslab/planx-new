import { createFileRoute, redirect } from "@tanstack/react-router";
import { hasFeatureFlag } from "lib/featureFlags";
import PaymentSettings from "pages/FlowEditor/components/Settings/Team/Payment";

export const Route = createFileRoute(
  "/_authenticated/app/$team/settings/payment",
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
  component: PaymentSettings,
});
