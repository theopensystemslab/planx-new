import type { Session } from "@opensystemslab/planx-core/types";
import {
  notFoundSession,
  validSession,
  payee,
  applicant,
  sessionPreviewData,
  flowGraph,
  paymentRequestResponse,
  validPaymentRequest,
  paymentAmountPence,
} from "./inviteToPayData.js";

export const validSessionQueryMock = {
  name: "GetSessionById",
  data: {
    lowcal_sessions_by_pk: {
      id: validSession.id,
      createdAt: validSession.createdAt,
      updatedAt: validSession.updatedAt,
      lockedAt: new Date("28 May 2023 12:00 UTC+1").toISOString(),
      submittedAt: undefined,
      data: validSession.data,
      flow: {
        id: validSession.flow.id,
        slug: validSession.flow.slug,
        name: validSession.flow.name,
        team: {
          slug: validSession.flow.team.slug,
          name: validSession.flow.team.name,
          settings: {
            referenceCode: validSession.flow.team.settings.referenceCode,
          },
        },
      },
    } as Session,
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
      createdAt: validSession.createdAt,
      updatedAt: validSession.updatedAt,
      lockedAt: new Date("28 May 2023 12:00 UTC+1").toISOString(),
      submittedAt: undefined,
      data: validSession.data,
      flow: {
        id: validSession.flow.id,
        slug: validSession.flow.slug,
        name: validSession.flow.name,
        team: {
          slug: validSession.flow.team.slug,
          name: validSession.flow.team.name,
          settings: {
            referenceCode: validSession.flow.team.settings.referenceCode,
          },
        },
      },
    } as Session,
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
    flowId: validSession.flow.id,
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
    paymentAmount: paymentAmountPence,
    payeeName: payee.name,
    payeeEmail: payee.email,
    sessionPreviewData: sessionPreviewData,
    govPayMetadata: [
      { key: "source", value: "PlanX" },
      { key: "paidViaInviteToPay", value: true },
      { key: "flow", value: validSession.flow.slug },
    ],
    feeBreakdown: {
      amount: {
        calculated: 0,
        calculatedVAT: 0,
        reduction: 0,
        exemption: 0,
        payable: 123.45,
        payableVAT: 0,
        fastTrack: 0,
        fastTrackVAT: 0,
        serviceCharge: 0,
        serviceChargeVAT: 0,
        paymentProcessing: 0,
        paymentProcessingVAT: 0,
      },
      reductions: [],
      exemptions: [],
    },
  },
};

export const validatePaymentRequestQueryMock = {
  name: "ValidatePaymentRequest",
  data: {
    query: {
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
