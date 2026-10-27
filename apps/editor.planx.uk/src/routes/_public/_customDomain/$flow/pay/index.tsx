import { createFileRoute, redirect } from "@tanstack/react-router";
import MakePayment from "pages/Pay/MakePayment";
import { getPaymentRequest } from "utils/routeUtils/payQueries";
import { z } from "zod";

const paymentSearchSchema = z.object({
  paymentRequestId: z.uuid(),
  // Stripe Checkout return URLs
  stripeSessionId: z.string().optional(),
  cancelled: z.coerce.boolean().optional(),
});

export const Route = createFileRoute("/_public/_customDomain/$flow/pay/")({
  validateSearch: paymentSearchSchema,
  onError: ({ params }) => {
    throw redirect({
      to: "/$flow/pay/not-found",
      params,
    });
  },
  loaderDeps: ({ search: { paymentRequestId } }) => ({ paymentRequestId }),
  loader: async ({ deps: { paymentRequestId }, params }) => {
    const paymentRequest = await getPaymentRequest(paymentRequestId);

    if (!paymentRequest) {
      throw redirect({
        to: "/$flow/pay/not-found",
        params,
      });
    }

    return {
      paymentRequest,
    };
  },
  component: PayIndexComponent,
});

function PayIndexComponent() {
  const data = Route.useLoaderData();
  const { stripeSessionId, cancelled } = Route.useSearch();

  return (
    <MakePayment
      {...data.paymentRequest}
      stripeSessionId={stripeSessionId}
      cancelled={cancelled}
    />
  );
}
