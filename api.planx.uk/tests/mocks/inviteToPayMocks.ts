import {
  notFoundSession,
  validSession,
  payee,
  sessionPreviewData,
  newPaymentRequest,
} from "./inviteToPayData";

export const validSessionQueryMock = {
  name: "GetSessionById",
  data: {
    lowcal_sessions_by_pk: {
      id: validSession.id,
      flowId: validSession.flowId,
      data: validSession.data,
    },
  },
  variables: {
    id: validSession.id,
  },
};

export const detailedValidSessionQueryMock = {
  name: "GetSessionDetails",
  data: {
    lowcal_sessions_by_pk: {
      id: validSession.id,
      flowId: validSession.flowId,
      lockedAt: new Date("28 May 2023 12:00 UTC+1").toISOString(),
      data: validSession.data,
    },
  },
  variables: {
    id: validSession.id,
  },
};

export const notFoundQueryMock = {
  name: "GetSessionDetails",
  data: {
    lowcal_sessions_by_pk: null,
  },
  variables: {
    id: notFoundSession.id,
  },
};

export const notFoundLockSessionQueryMock = {
  name: "LockSession",
  data: {
    update_lowcal_sessions: {
      returning: [],
    },
  },
  ignoreThesePropertiesInVariables: ["timestamp"],
  variables: {
    id: notFoundSession.id,
  },
};

export const lockSessionQueryMock = {
  name: "LockSession",
  data: {
    update_lowcal_sessions: {
      returning: [
        {
          locked_at: new Date("28 May 2023 12:00 UTC+1").toISOString(),
        },
      ],
    },
  },
  ignoreThesePropertiesInVariables: ["timestamp"],
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
    payeeName: payee.name,
    payeeEmail: payee.email,
    sessionPreviewData: sessionPreviewData,
  },
};
