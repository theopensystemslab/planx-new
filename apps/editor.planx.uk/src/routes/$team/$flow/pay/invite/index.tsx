import type { PaymentRequest } from "@opensystemslab/planx-core/types";
import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import InviteToPay from "pages/Pay/InviteToPay";
import React from "react";
import { getPaymentRequest } from "utils/routeUtils/payQueries";
import { z } from "zod";

// Search schema for invite route
const inviteSearchSchema = z.object({
  paymentRequestId: z.string().uuid(),
});

export const Route = createFileRoute("/$team/$flow/pay/invite/")({
  validateSearch: zodValidator(inviteSearchSchema),
  beforeLoad: async ({ search }) => {
    const { paymentRequestId } = search;

    const paymentRequest = await getPaymentRequest(paymentRequestId);

    if (!paymentRequest) {
      throw new Error("Payment request not found or invalid");
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
