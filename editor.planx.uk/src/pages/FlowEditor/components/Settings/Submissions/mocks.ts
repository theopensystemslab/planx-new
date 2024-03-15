export const mockApplications = [
  {
    sessionId: "test-session-3",
    submittedAt: "2024-03-22T12:00:00.000Z",
    paymentRequests: null,
    paymentStatus: [
      {
        govPaymentId: "test-govpay-3",
        createdAt: "2024-03-22T11:50:00.000Z",
        status: "error",
      },
      {
        govPaymentId: "test-govpay-3",
        createdAt: "2024-03-22T11:49:00.000Z",
        status: "created",
      },
    ],
    bopsApplications: null,
    uniformApplications: [
      {
        id: "test-uniform-2",
        submittedAt: "2024-03-22T11:55:00.000Z",
      },
    ],
    emailApplications: [
      {
        id: 3,
        recipient: "test-user-3@opensystemslab.io",
        submittedAt: "2024-03-22T12:00:00.000Z",
      },
    ],
  },

  {
    sessionId: "test-session-2",
    submittedAt: "2024-03-21T11:30:00.000Z",
    paymentRequests: [
      {
        id: "test-payment-request-2",
        createdAt: "2024-03-21T11:20:00.000Z",
        paidAt: "2024-03-21T11:25:00.000Z",
        govPaymentId: "test-govpay-2",
      },
    ],
    paymentStatus: [
      {
        govPaymentId: "test-govpay-2",
        createdAt: "2024-03-21T11:25:00.001Z",
        status: "success",
      },
      {
        govPaymentId: "test-govpay-2",
        createdAt: "2024-03-21T11:24:00.001Z",
        status: "created",
      },
    ],
    bopsApplications: null,
    uniformApplications: null,
    emailApplications: [
      {
        id: 2,
        recipient: "test-user-2@opensystemslab.io",
        submittedAt: "2024-03-21T11:30:00.000Z",
      },
    ],
  },
  {
    sessionId: "test-session-1",
    submittedAt: "2024-03-20T10:00:00.000Z",
    paymentRequests: [
      {
        id: "test-payment-request-1",
        createdAt: "2024-03-20T09:50:00.000Z",
        paidAt: "2024-03-20T09:55:00.000Z",
        govPaymentId: "test-govpay-1",
      },
    ],
    paymentStatus: [
      {
        govPaymentId: "test-govpay-1",
        createdAt: "2024-03-20T09:55:00.001Z",
        status: "success",
      },
      {
        govPaymentId: "test-govpay-1",
        createdAt: "2024-03-20T09:50:00.000Z",
        status: "created",
      },
    ],
    bopsApplications: [
      {
        id: "test-bops-1",
        submittedAt: "2024-03-20T09:53:00.000Z",
        destinationUrl: "https://test.opensystemslab.io/bops/1",
      },
    ],
    uniformApplications: [
      {
        id: "test-uniform-1",
        submittedAt: "2024-03-20T09:52:00.000Z",
      },
    ],
    emailApplications: [
      {
        id: 1,
        recipient: "test-user-1@opensystemslab.io",
        submittedAt: "2024-03-20T10:00:00.000Z",
      },
    ],
  },
];

export const mockQueryResult = {
  submissionServicesSummary: mockApplications,
};
