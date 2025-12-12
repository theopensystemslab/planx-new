import {
  type Session,
  type PaymentRequest,
  type FlowGraph,
  ComponentType,
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
  createdAt: "01-01-2025",
  updatedAt: "01-01-2025",
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
    team: {
      slug: "lambeth",
      name: "Lambeth",
      settings: {
        referenceCode: "LBH",
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
      title: "Pay",
      bannerTitle: "The fee is",
      description: "The fee covers the cost of processing your form",
      allowInviteToPay: true,
      inviteToPayTitle: "Details of your nominee",
      instructionsTitle: "How to pay",
      inviteToPayDescription: "You can invite someone else to pay.",
      instructionsDescription: "You can pay by using GOV.UK Pay.",
    },
    type: 400,
  },
};

export const flowWithInviteToPay: Flow["data"] = {
  _root: {
    edges: ["FindProperty", "Checklist", "Calculate", "SetFee", "Pay", "Send"],
  },
  Pay: {
    data: {
      fn: "application.fee.payable",
      title: "Pay",
      bannerTitle: "The fee is",
      description:
        '<p>The fee covers the cost of processing your form.         Find out more about how planning fees are calculated          <a href="https://www.gov.uk/guidance/fees-for-planning-applications" target="_self">here</a>.</p>',
      nomineeTitle: "Details of the person paying",
      allowInviteToPay: true,
      yourDetailsLabel: "Your name or organisation name",
      yourDetailsTitle: "Your details",
      instructionsTitle: "How to pay",
      secondaryPageTitle: "Invite someone else to pay",
      instructionsDescription:
        "<p>You can pay by using GOV.UK Pay.</p>         <p>Your form will be sent after you have paid the fee.          Wait until you see a form sent message before closing your browser.</p>",
    },
    type: ComponentType.Pay,
  },
  Calculate: {
    type: ComponentType.Calculate,
    data: {
      fn: "application.fee.calculated",
      tags: [],
      title: "Initial fee = 200",
      formula: "200",
      samples: {},
      defaults: {},
      formatOutputForAutomations: false,
    },
  },
  SetFee: {
    type: ComponentType.SetFee,
    data: {
      fn: "application.fee.payable",
      tags: [],
      applyCalculatedVAT: false,
      applyServiceCharge: false,
      fastTrackFeeAmount: 0,
      serviceChargeAmount: 40,
      applyPaymentProcessingFee: false,
      paymentProcessingFeePercentage: 0.01,
    },
  },
  FindProperty: {
    type: ComponentType.FindProperty,
    data: {
      allowNewAddresses: false,
    },
  },
  Send: {
    type: ComponentType.Send,
    data: {
      title: "Send",
      destinations: ["email"],
    },
  },
  Checklist: {
    type: ComponentType.Checklist,
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
    type: ComponentType.Answer,
  },
  ChecklistOptionTwo: {
    data: {
      text: "Build new",
      val: "new",
    },
    type: ComponentType.Answer,
  },
};
