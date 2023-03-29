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
    update_lowcal_sessions_by_pk: {
      locked_at: new Date("28 May 2023 12:00 UTC+1").toISOString(),
    },
  },
  ignoreThesePropertiesInVariables: ["timestamp"],
  variables: {
    id: validSession.id,
  },
};

export const checkSessionLockQueryMock = {
  name: "CheckSessionLock",
  data: {
    lowcal_sessions_by_pk: {
      locked_at: null,
    },
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
