import { queryMock } from "../../../../tests/graphqlQueryMock.js";

export const paymentIntent = {
  id: "pi_test_123",
  amount: 14500,
  metadata: {
    sessionId: "f2d8ca1d-a43b-43ec-b3d9-a9fec63ff19c",
    flowId: "7cd1c4b4-4229-424f-8d04-c9fdc958ef4e",
    teamSlug: "southwark",
    origin: "https://api.example.com",
  },
};

export const CONNECTED_ACCOUNT_ID = "acct_test_southwark";
export const DESTINATION_PAYMENT_ID = "py_test_destination";

export const expandedPaymentIntent = {
  ...paymentIntent,
  latest_charge: {
    id: "ch_test_123",
    transfer: {
      id: "tr_test_123",
      destination: CONNECTED_ACCOUNT_ID,
      destination_payment: DESTINATION_PAYMENT_ID,
    },
  },
};

export const mockSessionLookup = ({
  passportData = null,
  sessionExists = true,
}: {
  passportData?: unknown;
  sessionExists?: boolean;
} = {}) =>
  queryMock.mockQuery({
    name: "GetStripePaymentSession",
    matchOnVariables: false,
    data: { session: sessionExists ? { passportData } : null },
  });

export const getSessionLookup = () =>
  queryMock.getCalls().find((call) => call.id === "GetStripePaymentSession");

export const mockSessionLookupFailure = () =>
  queryMock.mockQuery({
    name: "GetStripePaymentSession",
    matchOnVariables: false,
    status: 500,
    data: {},
  });

/**
 * Hasura responds 200 with GraphQL errors for constraint violations
 */
const constraintViolation = (message: string) => ({
  name: "InsertStripePaymentStatus",
  matchOnVariables: false,
  data: {},
  graphqlErrors: [
    {
      message,
      extensions: {
        code: "constraint-violation",
        path: "$.selectionSet.insert_payment_status.args.objects",
      },
    } as unknown as Error,
  ],
});

export const mockPaymentStatusInsert = (
  outcome: "success" | "fail" | "fkViolation" | "uniqueViolation" = "success",
) => {
  switch (outcome) {
    case "fail":
      return queryMock.mockQuery({
        name: "InsertStripePaymentStatus",
        matchOnVariables: false,
        status: 500,
        data: {},
      });
    case "fkViolation":
      return queryMock.mockQuery(
        constraintViolation(
          'Foreign key violation. insert or update on table "payment_status" violates foreign key constraint "payment_status_flow_id_fkey"',
        ),
      );
    case "uniqueViolation":
      return queryMock.mockQuery(
        constraintViolation(
          'Uniqueness violation. duplicate key value violates unique constraint "payment_status_pkey"',
        ),
      );
    default:
      return queryMock.mockQuery({
        name: "InsertStripePaymentStatus",
        matchOnVariables: false,
        data: { insert_payment_status: { affected_rows: 1 } },
      });
  }
};

export const getPaymentStatusInsert = () =>
  queryMock.getCalls().find((call) => call.id === "InsertStripePaymentStatus");
