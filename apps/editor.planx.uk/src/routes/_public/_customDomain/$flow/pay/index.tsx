import type { PaymentRequest } from "@opensystemslab/planx-core/types";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import MakePayment from "pages/Pay/MakePayment";
import React from "react";
import { getPaymentRequest } from "utils/routeUtils/payQueries";
import { z } from "zod";

const paymentSearchSchema = z.object({
  paymentRequestId: z.string().uuid(),
});

export const Route = createFileRoute("/_public/_customDomain/$flow/pay/")({
  validateSearch: zodValidator(paymentSearchSchema),
  onError: ({ params }) => {
    throw redirect({
      to: "/$flow/pay/not-found",
      params,
    });
  },
  loaderDeps: ({ search: { paymentRequestId } }) => ({ paymentRequestId }),
  loader: async ({ deps: { paymentRequestId } }) => {
    const paymentRequest = await getPaymentRequest(paymentRequestId);

    if (!paymentRequest) {
      throw redirect({
        to: "/$flow/pay/not-found",
      });
    }

    return {
      paymentRequest,
    };
  },
  component: PayIndexComponent,
});

function PayIndexComponent() {
  const data = Route.useLoaderData() as { paymentRequest: PaymentRequest };

  return <MakePayment {...data.paymentRequest} />;
}
