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

export const Route = createFileRoute("/_public/_planXDomain/$team/$flow/pay/")({
  validateSearch: zodValidator(paymentSearchSchema),
  beforeLoad: async ({ search, params }) => {
    const { paymentRequestId } = search;

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
  const data = Route.useLoaderData() as { paymentRequest: PaymentRequest };

  return <MakePayment {...data.paymentRequest} />;
}
