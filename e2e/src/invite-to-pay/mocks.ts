import { PaymentRequest } from "@opensystemslab/planx-core/types";

export const mockPaymentRequest: Partial<PaymentRequest> = {
  payeeEmail: "testNominee@opensystemslab.com",
  payeeName: "Mr Nominee",
  sessionPreviewData: {
    "_address": {
      "title": "123, Test Street, Testville"
    },
    "proposal.projectType": [
      "extension",
      "swimmingPool"
    ]
  },
  paymentAmount: 12345,
  applicantName: "Mr Agent (Agency Ltd)",
}