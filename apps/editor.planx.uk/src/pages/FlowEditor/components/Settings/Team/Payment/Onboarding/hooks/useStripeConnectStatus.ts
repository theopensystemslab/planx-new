import { useQuery } from "@tanstack/react-query";
import { getStripeConnectStatus } from "lib/api/stripe/requests";

export const useStripeConnectStatus = (teamSlug: string) =>
  useQuery({
    queryKey: ["stripeConnectStatus", teamSlug],
    queryFn: () => getStripeConnectStatus(teamSlug),
  });
