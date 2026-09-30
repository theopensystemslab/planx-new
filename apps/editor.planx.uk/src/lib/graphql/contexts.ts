import type { DefaultContext } from "@apollo/client";
import type { Role } from "@opensystemslab/planx-core/types";

/**
 * Unauthenticated requests, e.g. applicants on public routes
 */
export const publicContext = {
  role: "public",
} as const satisfies DefaultContext;

/**
 * Unauthenticated Save & Return requests
 * Hasura "public" role users need the sessionId and email for lowcal_sessions access
 */
export const sessionContext = ({
  sessionId,
  email,
}: {
  sessionId: string;
  email?: string;
}) =>
  ({
    ...publicContext,
    headers: {
      "x-hasura-lowcal-session-id": sessionId,
      // email may be absent for non save and return journeys
      "x-hasura-lowcal-email": email?.toLowerCase() || "",
    },
  }) satisfies DefaultContext;

/**
 * Unauthenticated Invite to Pay requests
 * Hasura "public" role users need the paymentRequestId for payment_requests access
 */
export const paymentRequestContext = (paymentRequestId: string) =>
  ({
    ...publicContext,
    headers: {
      "x-hasura-payment-request-id": paymentRequestId,
    },
  }) satisfies DefaultContext;

/**
 * Authenticated requests which require a specific Hasura role, e.g. "teamAdmin" or "platformAdmin"
 * Without this, Hasura uses the default role from the user's JWT
 */
export const roleContext = (role: Role | undefined) =>
  ({
    headers: {
      "x-hasura-role": role,
    },
  }) satisfies DefaultContext;
