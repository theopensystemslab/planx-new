import type {
  Session,
  PaymentRequest,
  PaymentRequestSessionPreview,
} from "@opensystemslab/planx-core/types/types";

export const validEmail = "the-payee@opensystemslab.io";

export const notFoundSession: Partial<Session> = {
  id: "3da7734f-d5c5-4f69-a261-1b31c2adf6fc",
};

export const validSession: Session = {
  id: "e62fc9fd-4acb-4bdd-9dbb-01fb996c656c",
  flowId: "", // TODO
  data: {
    id: "e62fc9fd-4acb-4bdd-9dbb-01fb996c656c",
    passport: {
      data: {
        _address: {
          single_line_address: "1 House, Street, Town, City, PO27 0DE",
        },
        "applicant.agent.name.first": "Jo",
        "applicant.agent.name.last": "Smith",
        "proposal.projectType": "new.office",
      },
    },
    breadcrumbs: {}, // TODO
  },
};

export const paymentRequestSessionPreview: PaymentRequestSessionPreview = {
  agentName: "Jo Smith",
  address: "1 House, Street, Town, City, PO27 0DE",
  projectType: "new.office",
};

export const newPaymentRequest: PaymentRequest = {
  id: "09655c28-3f34-4619-9385-cd57312acc44",
  sessionId: validSession.id,
  payeeEmail: validEmail,
  data: paymentRequestSessionPreview,
};
