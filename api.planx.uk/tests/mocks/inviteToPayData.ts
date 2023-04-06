import type { Session, PaymentRequest } from "@opensystemslab/planx-core";

export const validEmail = "the-payee@opensystemslab.io";

export const payee = {
  name: "Pay Ee",
  email: validEmail,
};

export const notFoundSession: Partial<Session> = {
  id: "3da7734f-d5c5-4f69-a261-1b31c2adf6fc",
};

export const sessionPreviewData = {
  _address: {
    title: "1 House, Street, Town, City, PO27 0DE",
  },
  "applicant.agent.name.first": "Jo",
  "applicant.agent.name.last": "Smith",
  "proposal.projectType": "new.office",
  "fee": 103,
};

export const validSession: Session = {
  id: "e62fc9fd-4acb-4bdd-9dbb-01fb996c656c",
  flowId: "741a2372-b0b4-4f30-98a8-7c98c6464954",
  data: {
    id: "e62fc9fd-4acb-4bdd-9dbb-01fb996c656c",
    passport: {
      data: sessionPreviewData,
    },
    breadcrumbs: {},
  },
};

export const newPaymentRequest: PaymentRequest = {
  id: "09655c28-3f34-4619-9385-cd57312acc44",
  sessionId: validSession.id,
  payeeName: payee.name,
  payeeEmail: payee.email,
  sessionPreviewData: sessionPreviewData,
};

export const validPaymentRequest = {
  id: "09655c28-3f34-4619-9385-cd57312acc44",
  payee_email: payee.email,
  payee_name: payee.name,
  session_id: validSession.id,
  session_preview_data: sessionPreviewData,
  created_at: new Date("01 Apr 2023 12:00 UTC+1").toISOString(),
  paid_at: null,
  session: {
    email: "the-agent@opensystemslab.io",
    flow: {
      slug: "apply-for-a-lawful-development-certificate",
      team: {
        name: "Buckinghamshire",
        slug: "buckinghamshire",
        domain: "planningservices.buckinghamshire.gov.uk",
        notify_personalisation: {
          helpEmail: "help@council.gov.uk",
          helpPhone: "123",
          helpOpeningHours: "9a-5p",
          emailReplyToId: "123",
        },
      },
    },
  },
};
