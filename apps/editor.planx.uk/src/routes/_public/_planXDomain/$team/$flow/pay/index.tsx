import { createFileRoute, redirect } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import MakePayment from "pages/Pay/MakePayment";
import { getPaymentRequest } from "utils/routeUtils/payQueries";
import { z } from "zod";

const paymentSearchSchema = z.object({
  paymentRequestId: z.string().uuid(),
  // Stripe Checkout return URLs
  stripeSessionId: z.string().optional(),
  cancelled: z.coerce.boolean().optional(),
});

export const Route = createFileRoute("/_public/_planXDomain/$team/$flow/pay/")({
  validateSearch: zodValidator(paymentSearchSchema),
  onError: ({ params }) => {
    throw redirect({
      to: "/$team/$flow/pay/not-found",
      params,
    });
  },
  loaderDeps: ({ search: { paymentRequestId } }) => ({ paymentRequestId }),
  loader: async ({ deps: { paymentRequestId }, params }) => {
    const paymentRequest = await getPaymentRequest(paymentRequestId);

    if (!paymentRequest) {
      throw redirect({
        to: "/$team/$flow/pay/not-found",
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
