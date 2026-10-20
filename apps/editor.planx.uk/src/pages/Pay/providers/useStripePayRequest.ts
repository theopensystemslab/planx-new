import { getStripeCheckoutURL } from "@planx/components/Pay/Public/providers/stripeCheckout";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createPaymentRequestCheckoutSession,
  fulfilPaymentRequest,
} from "lib/api/stripe/requests";
import { useRef } from "react";
import { z } from "zod";

import type { PaymentRequestState } from "./types";

const NOT_COMPLETED_WARNING =
  "Your payment wasn't completed. You can try again when you're ready.";

const NOT_CONFIRMED_WARNING =
  "We could not confirm your payment. If you have already paid, checking again will confirm your payment.";

const isNotPaidError = (error: unknown) =>
  z
    .object({
      statusCode: z.union([z.literal(400), z.literal(404), z.literal(409)]),
    })
    .safeParse(error).success;

/**
 * Pay a payment request with Stripe Checkout
 *
 * Stripe returns the payer to /pay with either `stripeSessionId` (success URL) or `cancelled` (cancel URL)
 */
export function useStripePayRequest({
  paymentRequestId,
  stripeSessionId,
  cancelled,
}: {
  paymentRequestId: string;
  stripeSessionId?: string;
  cancelled?: boolean;
}): PaymentRequestState {
  const checkout = useMutation({
    mutationFn: async () => {
      const { url } =
        await createPaymentRequestCheckoutSession(paymentRequestId);
      return getStripeCheckoutURL(url);
    },
    onSuccess: (url) => window.location.assign(url),
    throwOnError: true,
  });

  // The webhook also fulfils the payment request, this is the fast path for the payer
  // Fulfilment is idempotent, so it's read like a query - it reports whether this Checkout Session paid
  const fulfilment = useQuery({
    queryKey: ["fulfilPaymentRequest", paymentRequestId, stripeSessionId],
    queryFn: () =>
      fulfilPaymentRequest({
        paymentRequestId,
        checkoutSessionId: stripeSessionId!,
      }),
    enabled: Boolean(stripeSessionId),
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  // Only create one Checkout Session per page load, so a double click can't create two
  const hasStartedCheckout = useRef(false);
  const startCheckout = () => {
    if (hasStartedCheckout.current) return;
    hasStartedCheckout.current = true;
    checkout.mutate();
  };

  // Hide the Pay button from the click until the redirect
  if (checkout.isPending || checkout.isSuccess) {
    return { status: "loading", text: "Connecting to the payment page" };
  }

  if (stripeSessionId) {
    if (fulfilment.isSuccess) return { status: "paid" };

    if (fulfilment.isError && !fulfilment.isFetching) {
      return isNotPaidError(fulfilment.error)
        ? {
            status: "ready",
            buttonTitle: "Pay now",
            onPay: startCheckout,
            warning: NOT_COMPLETED_WARNING,
          }
        : {
            status: "ready",
            buttonTitle: "Check payment status",
            onPay: () => fulfilment.refetch(),
            warning: NOT_CONFIRMED_WARNING,
          };
    }

    return { status: "loading", text: "Confirming your payment" };
  }

  return {
    status: "ready",
    buttonTitle: "Pay now",
    onPay: startCheckout,
    warning: cancelled ? NOT_COMPLETED_WARNING : undefined,
  };
}
