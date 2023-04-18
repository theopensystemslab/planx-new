import {
  notFoundSession,
  validSession,
  payee,
  applicant,
  paymentAmount,
  sessionPreviewData,
  flowGraph,
  paymentRequestResponse,
  validPaymentRequest,
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
  variables: {
    id: validSession.id,
  },
};

export const unlockSessionQueryMock = {
  name: "UnlockSession",
  data: {
    update_lowcal_sessions: {
      returning: [
        {
          locked_at: null,
        },
      ],
    },
  },
  variables: {
    id: validSession.id,
  },
};

export const getPublishedFlowDataQueryMock = {
  name: "GetLatestPublishedFlowData",
  data: {
    published_flows: [
      {
        data: flowGraph,
      },
    ],
  },
  variables: {
    flowId: validSession.flowId,
  },
};

export const createPaymentRequestQueryMock = {
  name: "CreatePaymentRequest",
  data: {
    insert_payment_requests_one: {
      ...paymentRequestResponse,
    },
  },
  variables: {
    sessionId: validSession.id,
    applicantName: applicant.name,
    paymentAmount,
    payeeName: payee.name,
    payeeEmail: payee.email,
    sessionPreviewData: sessionPreviewData,
  },
};

export const validatePaymentRequestQueryMock = {
  name: "ValidatePaymentRequest",
  data: {
    payment_requests_by_pk: {
      ...validPaymentRequest,
    },
  },
  variables: {
    paymentRequestId: validPaymentRequest.id,
  },
};

export const validatePaymentRequestNotFoundQueryMock = {
  name: "ValidatePaymentRequest",
  data: {
    payment_requests_by_pk: null,
  },
  variables: {
    paymentRequestId: "123-wrong-456",
  },
};
