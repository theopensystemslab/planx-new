import type { GraphQLClient } from "graphql-request";
import { gql } from "graphql-request";

export async function getStripePaymentId({
  paymentRequestId,
  adminGQLClient,
}: {
  paymentRequestId: string;
  adminGQLClient: GraphQLClient;
}): Promise<string | null | undefined> {
  const { paymentRequest } = await adminGQLClient.request<{
    paymentRequest: { stripePaymentId: string | null } | null;
  }>(
    gql`
      query GetStripePaymentRequestPaymentId($id: uuid!) {
        paymentRequest: payment_requests_by_pk(id: $id) {
          stripePaymentId: stripe_payment_id
        }
      }
    `,
    { id: paymentRequestId },
  );
  return paymentRequest?.stripePaymentId;
}
