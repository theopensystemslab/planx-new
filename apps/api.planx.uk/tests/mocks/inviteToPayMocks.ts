import type { Session } from "@opensystemslab/planx-core/types";

import {
  applicant,
  flowGraph,
  payee,
  paymentAmountPence,
  paymentRequestResponse,
  sessionPreviewData,
  validPaymentRequest,
  validSession,
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
        email_template: validSession.flow.email_template,
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
        email_template: validSession.flow.email_template,
      },
    } as Session,
  },
  variables: {
    id: validSession.id,
  },
};

export const findSessionForInviteQueryMock = {
  name: "FindSessionForInvite",
  data: {
    sessions: [{ id: validSession.id }],
  },
  variables: {
    sessionId: validSession.id,
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

const paymentRequestMetadata = () => [
  { key: "source", value: "PlanX", type: "static" },
  { key: "paidViaInviteToPay", value: true, type: "static" },
  { key: "flow", value: validSession.flow.slug, type: "static" },
];

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
    govPayMetadata: paymentRequestMetadata(),
    stripeMetadata: paymentRequestMetadata(),
    feeBreakdown: {
      amount: {
        calculated: 0,
        calculatedVAT: 0,
        reduction: 0,
        reductionVAT: 0,
        exemption: 0,
        exemptionVAT: 0,
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
