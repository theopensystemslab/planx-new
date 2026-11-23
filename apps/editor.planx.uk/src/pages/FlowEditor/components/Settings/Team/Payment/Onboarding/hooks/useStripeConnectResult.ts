import { useNavigate } from "@tanstack/react-router";
import { useToast } from "hooks/useToast";
import type { StripeConnectResult } from "lib/api/stripe/types";
import { useStore } from "pages/FlowEditor/lib/store";
import { useEffect } from "react";

import { useStripeConnectStatus } from "./useStripeConnectStatus";

/**
 * Report the result of connecting a Stripe account, from the API's redirect back to the payments page
 * Used once per page, as a team with multiple accounts has several Stripe account sections
 */
export const useStripeConnectResult = (stripeResult?: StripeConnectResult) => {
  const teamSlug = useStore((state) => state.teamSlug);
  const toast = useToast();
  const navigate = useNavigate();
  const { refetch } = useStripeConnectStatus(teamSlug);

  useEffect(() => {
    if (!stripeResult) return;

    if (stripeResult.type === "success") {
      toast.success("Stripe account connected successfully");
      refetch();
    } else {
      toast.error(stripeResult.message);
    }

    navigate({
      to: ".",
      search: (prev) => ({
        ...prev,
        stripeConnected: undefined,
        stripeError: undefined,
      }),
      replace: true,
    });
    // Only run once, on mount, to consume the redirect params from the URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
