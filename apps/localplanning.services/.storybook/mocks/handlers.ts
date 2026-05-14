import { http, HttpResponse, delay } from "msw";
import type {
  DraftApplication,
  AwaitingPaymentApplication,
  SubmittedApplication,
} from "../../src/components/applications/hooks/useFetchApplications";

export const mockDraft: DraftApplication = {
  id: "draft-001",
  status: "draft",
  address: "12 Planning Lane, Bristol, BS1 1AA",
  createdAt: "2025-03-01T10:00:00Z",
  updatedAt: "2025-03-01T10:00:00Z",
  expiresAt: "2025-09-01T10:00:00Z",
  service: { name: "Apply for a lawful development certificate" },
  team: { slug: "bristol", name: "Bristol City Council" },
  serviceUrl: "http://localhost:3000/bristol/apply-for-lawful-development",
};

export const mockAwaitingPayment: AwaitingPaymentApplication = {
  id: "payment-001",
  status: "awaitingPayment",
  address: "7 Heritage Square, Manchester, M1 2BC",
  createdAt: "2025-02-10T09:00:00Z",
  updatedAt: "2025-04-15T14:30:00Z",
  expiresAt: "2025-08-15T14:30:00Z",
  service: { name: "Prior approval for a larger home extension" },
  team: { slug: "manchester", name: "Manchester City Council" },
  paymentUrl: "http://localhost:3000/manchester/pay/payment-001",
};

export const mockSubmitted: SubmittedApplication = {
  id: "submitted-001",
  status: "submitted",
  address: "44 Old Market Street, Leeds, LS1 6AB",
  createdAt: "2025-01-05T08:00:00Z",
  updatedAt: "2025-01-20T16:00:00Z",
  expiresAt: "2025-07-20T16:00:00Z",
  submittedAt: "2025-01-20T16:00:00Z",
  service: { name: "Apply for planning permission" },
  team: { slug: "leeds", name: "Leeds City Council" },
};

export const mockApplications = [mockDraft, mockAwaitingPayment, mockSubmitted];

export const handlers = [
  // Fetch applications list
  http.post("*/lps/applications", () => {
    return HttpResponse.json(mockApplications);
  }),

  // Magic link login - returns 200, then LoginForm redirects to check-your-inbox
  http.post("*/lps/login", () => {
    return HttpResponse.json({}, { status: 200 });
  }),

  // Soft-delete application (GraphQL mutation)
  http.post("*/graphql", () => {
    return HttpResponse.json({
      data: { applications: { id: mockDraft.id } },
    });
  }),
];

export const loginErrorHandlers = [
  http.post("*/lps/login", () => {
    return HttpResponse.json({ error: "LOGIN_FAILED" }, { status: 500 });
  }),
];

export const emptyHandlers = [
  http.post("*/lps/applications", () => HttpResponse.json([])),
];

export const loadingHandlers = [
  http.post("*/lps/applications", async () => {
    await delay("infinite");
    return HttpResponse.json([]);
  }),
];

export const errorInvalidLinkHandlers = [
  http.post("*/lps/applications", () =>
    HttpResponse.json({ error: "LINK_INVALID" }, { status: 401 })
  ),
];

export const errorExpiredLinkHandlers = [
  http.post("*/lps/applications", () =>
    HttpResponse.json({ error: "LINK_EXPIRED" }, { status: 401 })
  ),
];

export const errorConsumedLinkHandlers = [
  http.post("*/lps/applications", () =>
    HttpResponse.json({ error: "LINK_CONSUMED" }, { status: 401 })
  ),
];
