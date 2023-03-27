import {
  notFoundSession,
  validSession,
  validEmail,
  paymentRequestSessionPreview,
  newPaymentRequest,
} from "./inviteToPayData";

export const notFoundQueryMock = {
  name: "GetSessionById",
  data: {
    lowcal_sessions_by_pk: null,
  },
  variables: {
    id: notFoundSession.id,
  },
};

export const validSessionQueryMock = {
  name: "GetSessionById",
  data: {
    lowcal_sessions_by_pk: {
      id: validSession.id,
      flow_id: validSession.flowId,
      data: validSession.data,
    },
  },
  variables: {
    id: validSession.id,
  },
};

export const lockSessionQueryMock = {
  name: "LockSession",
  data: {
    read_only: true,
  },
  variables: {
    id: validSession.id,
  },
};

export const createPaymentRequestQueryMock = {
  name: "CreatePaymentRequest",
  data: {
    insert_payment_requests_one: {
      ...newPaymentRequest,
    },
  },
  variables: {
    sessionId: validSession.id,
    payeeEmail: validEmail,
    data: paymentRequestSessionPreview,
  },
};
