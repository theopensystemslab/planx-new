import type { PaymentRequest } from "@opensystemslab/planx-core/types";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import InviteToPay from "pages/Pay/InviteToPay";
import React from "react";
import { getPaymentRequest } from "utils/routeUtils/payQueries";
import { z } from "zod";

// Search schema for invite route
const inviteSearchSchema = z.object({
  paymentRequestId: z.string().uuid(),
});

export const Route = createFileRoute(
  "/_public/_customDomain/$flow/pay/invite/",
)({
  validateSearch: zodValidator(inviteSearchSchema),
  beforeLoad: async ({ search }) => {
    const { paymentRequestId } = search;

    const paymentRequest = await getPaymentRequest(paymentRequestId);

    if (!paymentRequest) {
      throw redirect({
        to: "/$team/$flow/pay/invite/failed",
        params: { team: "", flow: "" },
      });
    }

    return {
      paymentRequest,
    };
  },
  component: InviteToPayComponent,
});

function InviteToPayComponent() {
  const data = Route.useLoaderData() as { paymentRequest: PaymentRequest };

  return <InviteToPay {...data.paymentRequest} />;
}
