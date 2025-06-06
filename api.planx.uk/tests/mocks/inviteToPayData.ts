import type {
  Session,
  PaymentRequest,
  FlowGraph,
} from "@opensystemslab/planx-core/types";
import type { Flow } from "../../types.js";

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
  "proposal.projectType": ["new.office"],
};

export const validSession: Session = {
  id: "e62fc9fd-4acb-4bdd-9dbb-01fb996c656c",
  data: {
    id: "741a2372-b0b4-4f30-98a8-7c98c6464954",
    passport: {
      data: {
        "application.fee.payable": paymentAmountPounds,
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
  flow: {
    id: "741a2372-b0b4-4f30-98a8-7c98c6464954",
    slug: "apply-for-a-lawful-development-certificate",
    name: "Apply for a Lawful Development Certificate",
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
  feeBreakdown: {
    amount: {
      calculated: 123.45,
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
      name: "Apply for a Lawful Development Certificate",
      team: {
        name: "Buckinghamshire",
        slug: "buckinghamshire",
        domain: "planningservices.buckinghamshire.gov.uk",
        settings: {
          helpEmail: "help@council.gov.uk",
          helpPhone: "123",
          helpOpeningHours: "9a-5p",
          emailReplyToId: "727d48fa-cb8a-42f9-b8b2-55032f3bb451",
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
      fn: "application.fee.payable",
      val: paymentAmountPounds,
    },
    type: 380,
  },
  fgl2iSPlB7: {
    data: {
      fn: "application.fee.payable",
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

export const flowWithInviteToPay: Flow["data"] = {
  _root: {
    edges: ["FindProperty", "Checklist", "SetValue", "Pay", "Send"],
  },
  Pay: {
    data: {
      fn: "fee",
      title: "Pay for your application",
      bannerTitle: "The planning fee for this application is",
      description:
        '<p>The planning fee covers the cost of processing your application.         Find out more about how planning fees are calculated          <a href="https://www.gov.uk/guidance/fees-for-planning-applications" target="_self">here</a>.</p>',
      nomineeTitle: "Details of the person paying",
      allowInviteToPay: true,
      yourDetailsLabel: "Your name or organisation name",
      yourDetailsTitle: "Your details",
      instructionsTitle: "How to pay",
      secondaryPageTitle: "Invite someone else to pay for this application",
      instructionsDescription:
        "<p>You can pay for your application by using GOV.UK Pay.</p>         <p>Your application will be sent after you have paid the fee.          Wait until you see an application sent message before closing your browser.</p>",
    },
    type: 400,
  },
  SetValue: {
    type: 380,
    data: {
      fn: "fee",
      val: "1",
    },
  },
  FindProperty: {
    type: 9,
    data: {
      allowNewAddresses: false,
    },
  },
  Send: {
    type: 650,
    data: {
      title: "Send",
      destinations: ["email"],
    },
  },
  Checklist: {
    type: 105,
    data: {
      allRequired: false,
      fn: "proposal.projectType",
      text: "What do the works involve?",
    },
    edges: ["ChecklistOptionOne", "ChecklistOptionTwo"],
  },
  ChecklistOptionOne: {
    data: {
      text: "Alter",
      val: "alter",
    },
    type: 200,
  },
  ChecklistOptionTwo: {
    data: {
      text: "Build new",
      val: "new",
    },
    type: 200,
  },
};
