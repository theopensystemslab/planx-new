import { queryMock } from "../../../../tests/graphqlQueryMock.js";

export const paymentIntent = {
  id: "pi_test_123",
  amount: 14500,
  metadata: {
    sessionId: "f2d8ca1d-a43b-43ec-b3d9-a9fec63ff19c",
    flowId: "7cd1c4b4-4229-424f-8d04-c9fdc958ef4e",
    teamSlug: "southwark",
  },
};

export const CONNECTED_ACCOUNT_ID = "acct_test_southwark";
export const DESTINATION_PAYMENT_ID = "py_test_destination";

export const transfer = {
  id: "tr_test_123",
  source_transaction: "ch_test_123",
  destination: CONNECTED_ACCOUNT_ID,
  destination_payment: DESTINATION_PAYMENT_ID,
};

export const expandedCharge = {
  id: "ch_test_123",
  payment_intent: paymentIntent,
};

export const mockPassportLookup = (passportData: unknown = null) =>
  queryMock.mockQuery({
    name: "GetSessionPassportData",
    matchOnVariables: false,
    data: { session: { passportData } },
  });

export const mockPassportLookupFailure = () =>
  queryMock.mockQuery({
    name: "GetSessionPassportData",
    matchOnVariables: false,
    status: 500,
    data: {},
  });

export const mockPaymentStatusInsert = (
  outcome: "success" | "fail" = "success",
) =>
  queryMock.mockQuery(
    outcome === "fail"
      ? {
          name: "InsertStripePaymentStatus",
          matchOnVariables: false,
          status: 500,
          data: {},
        }
      : {
          name: "InsertStripePaymentStatus",
          matchOnVariables: false,
          data: { insert_payment_status: { affected_rows: 1 } },
        },
  );

export const getPaymentStatusInsert = () =>
  queryMock.getCalls().find((call) => call.id === "InsertStripePaymentStatus");
