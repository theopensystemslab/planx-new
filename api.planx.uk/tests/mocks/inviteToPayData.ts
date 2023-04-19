import type {
  Session,
  PaymentRequest,
  FlowGraph,
} from "@opensystemslab/planx-core/types/types";

export const validEmail = "the-payee@opensystemslab.io";

export const payee = {
  name: "Pay Ee",
  email: validEmail,
};

export const applicant = {
  name: "Applic Ant",
};

export const paymentAmountPounds = 123.45;
export const paymentAmountPence = 12345;

export const notFoundSession: Partial<Session> = {
  id: "3da7734f-d5c5-4f69-a261-1b31c2adf6fc",
};

export const sessionPreviewData = {
  _address: {
    title: "1 House, Street, Town, City, PO27 0DE",
  },
  "proposal.projectType": [ "new.office" ],
};

export const validSession: Session = {
  id: "e62fc9fd-4acb-4bdd-9dbb-01fb996c656c",
  flowId: "741a2372-b0b4-4f30-98a8-7c98c6464954",
  data: {
    id: "e62fc9fd-4acb-4bdd-9dbb-01fb996c656c",
    passport: {
      data: {
        amountToPay: paymentAmountPounds,
        ...sessionPreviewData,
      },
    },
    // breadcrumbs is missing the pay component to reflect current implementation
    breadcrumbs: {
      NATwM9rXTQ: {
        auto: false,
      },
    },
  },
};

export const paymentRequestResponse: Partial<PaymentRequest> = {
  id: "09655c28-3f34-4619-9385-cd57312acc44",
  sessionId: validSession.id,
  applicantName: applicant.name,
  payeeName: payee.name,
  payeeEmail: payee.email,
  paymentAmount: paymentAmountPence,
  sessionPreviewData: sessionPreviewData,
};

export const validPaymentRequest = {
  id: "09655c28-3f34-4619-9385-cd57312acc44",
  payeeEmail: payee.email,
  payeeName: payee.name,
  sessionId: validSession.id,
  sessionPreviewData: sessionPreviewData,
  createdAt: new Date("01 Apr 2023 12:00 UTC+1").toISOString(),
  paidAt: null,
  applicantName: "agent display name",
  paymentAmount: paymentAmountPence,
  session: {
    email: "the-agent@opensystemslab.io",
    flow: {
      slug: "apply-for-a-lawful-development-certificate",
      team: {
        name: "Buckinghamshire",
        slug: "buckinghamshire",
        domain: "planningservices.buckinghamshire.gov.uk",
        notifyPersonalisation: {
          helpEmail: "help@council.gov.uk",
          helpPhone: "123",
          helpOpeningHours: "9a-5p",
          emailReplyToId: "123",
        },
      },
    },
  },
};

export const flowGraph: FlowGraph = {
  _root: {
    edges: ["NATwM9rXTQ", "fgl2iSPlB7"],
  },
  NATwM9rXTQ: {
    data: {
      fn: "amountToPay",
      val: paymentAmountPounds,
    },
    type: 380,
  },
  fgl2iSPlB7: {
    data: {
      fn: "amountToPay",
      color: "#EFEFEF",
      title: "Pay for your application",
      bannerTitle: "The planning fee for this application is",
      description:
        "The planning fee covers the cost of processing your application",
      allowInviteToPay: true,
      inviteToPayTitle: "Details of your nominee",
      instructionsTitle: "How to pay",
      inviteToPayDescription:
        "You can invite someone else to pay for your application.",
      instructionsDescription:
        "You can pay for your application by using GOV.UK Pay.",
    },
    type: 400,
  },
};
