import type { Submission, SubmissionSummary } from "./types";

const sendToEmailSuccessSummary: SubmissionSummary = {
  id: "126ec0c4-12f2-1209-aa09-11294ec3ee12",
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  flowName: "Dsn impact metrics",
  address: "1, CALVERT AVENUE, COLINDALE, LONDON, BARNET, NW9 4EW",
  eventCreatedAt: "2024-01-12T12:17:42.275655+00:00",
  eventType: "Send to email",
  status: "Success",
};

const sendToBOPSFailureSummary: SubmissionSummary = {
  id: "556ec0c4-55f2-7709-aa09-15599ec3ee99",
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  flowName: "Apply for a lawful development certificate",
  address: "2, CALVERT AVENUE, COLINDALE, LONDON, BARNET, NW9 4EW",
  eventCreatedAt: "2024-01-12T12:18:12.805747+00:00",
  eventType: "Submit to BOPS",
  status: "Failed (400)",
  consolidatedStatus: "Submit to BOPS failed",
};

const jsonErrorSummary: SubmissionSummary = {
  id: "306c7498-9cd3-4e8e-bafe-2e2de5133caa",
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  flowName: "Report a breach",
  address: "3, CALVERT AVENUE, COLINDALE, LONDON, BARNET, NW9 4EW",
  eventCreatedAt: "2024-01-12T12:18:12.805747+00:00",
  eventType: "Submit to Uniform",
  status: "Failed (500)",
  consolidatedStatus: "Submit to Uniform failed",
};

const invitedToPaySummary: SubmissionSummary = {
  id: "6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5",
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  flowName: "Apply for planning permission",
  address: "4, CALVERT AVENUE, COLINDALE, LONDON, BARNET, NW9 4EW",
  eventCreatedAt: "2025-01-12T12:18:12.805747+00:00",
  eventType: "Invited to pay",
  status: "Success",
  consolidatedStatus: "Invited to pay",
};

export const mockSubmissionsGrouped: SubmissionSummary[] = [
  sendToEmailSuccessSummary,
  sendToBOPSFailureSummary,
  jsonErrorSummary,
  invitedToPaySummary,
];

// multiple events for the same sessionId are for the SubmissionDetailModal tests
const sendToEmailSuccess: Submission = {
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  sessionId: "6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5",
  eventId: "2023508e-0fee-4726-8b04-5fcbba7d37c9",
  eventType: "Send to email",
  status: "Success",
  retry: true,
  response: { data: { message: "Success!" } },
  createdAt: "2026-08-20T09:03:00.021681+00:00", // events happen in specified sequence to test groupEvents logic
  flowName: "Report a planning breach",
  address: "3, CALVERT AVENUE, COLINDALE, LONDON, BARNET, NW9 4EW",
};
const sendToBOPSSuccess: Submission = {
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  sessionId: "6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5",
  eventId: "7491cca7-833d-4680-91c0-b3faa1e23977",
  eventType: "Submit to BOPS",
  status: "Success",
  retry: true,
  response: { data: { message: "Success!" } },
  createdAt: "2026-08-20T09:04:00.021681+00:00",
  flowName: "Report a planning breach",
  address: "3, CALVERT AVENUE, COLINDALE, LONDON, BARNET, NW9 4EW",
};
const sendToEmailFailure: Submission = {
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  sessionId: "6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5",
  eventId: "2023508e-0fee-4726-8b04-5fcbba7d37c9",
  eventType: "Send to email",
  status: "Failed (500)",
  retry: false,
  response: { data: { message: "Failure" } },
  createdAt: "2026-08-20T09:01:00.021681+00:00",
  flowName: "Report a planning breach",
  address: "3, CALVERT AVENUE, COLINDALE, LONDON, BARNET, NW9 4EW",
};

const sendToBOPSFailure: Submission = {
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  sessionId: "6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5",
  eventId: "7491cca7-833d-4680-91c0-b3faa1e23977",
  eventType: "Submit to BOPS",
  status: "Failed (400)",
  retry: false,
  response: { data: { message: "Failure" } },
  createdAt: "2026-08-20T09:00:00.021681+00:00",
  flowName: "Report a planning breach",
  address: "3, CALVERT AVENUE, COLINDALE, LONDON, BARNET, NW9 4EW",
};

const sendToAWSFailureAttempt1: Submission = {
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  sessionId: "6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5",
  eventId: "7491cca7-833d-4680-91c0-b3faa1e23977",
  eventType: "Upload to AWS S3",
  status: "Failed (400)",
  retry: false,
  response: { data: { message: "Failure" } },
  createdAt: "2026-08-20T09:00:00.021681+00:00",
  flowName: "Report a planning breach",
  address: "3, CALVERT AVENUE, COLINDALE, LONDON, BARNET, NW9 4EW",
};

const sendToAWSFailureAttempt2: Submission = {
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  sessionId: "6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5",
  eventId: "b28b9692-6097-4510-9c3e-a6cc79d6d1e8",
  eventType: "Upload to AWS S3",
  status: "Failed (400)",
  retry: false,
  response: { data: { message: "Failure" } },
  createdAt: "2026-08-20T09:01:00.021681+00:00",
  flowName: "Report a planning breach",
  address: "3, CALVERT AVENUE, COLINDALE, LONDON, BARNET, NW9 4EW",
};

export const mockPay = {
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  sessionId: "6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5",
  eventId: "pay-123",
  eventType: "Pay" as const,
  status: "Failed" as const,
  retry: false,
  response: {},
  createdAt: "2026-08-20T09:05:00.021681+00:00",
  flowName: "Report a planning breach",
  address: "3, CALVERT AVENUE, COLINDALE, LONDON, BARNET, NW9 4EW",
};

export const mockSubmissionEvents = [
  sendToEmailSuccess,
  sendToBOPSSuccess,
  sendToEmailFailure,
  sendToBOPSFailure,
  sendToAWSFailureAttempt1,
  sendToAWSFailureAttempt2,
];

export const mockSubmissionFailureEvents = [
  sendToEmailFailure,
  sendToBOPSFailure,
];

export const mockSubmissionSingleFailureEvents = [
  sendToBOPSSuccess,
  sendToEmailFailure,
  sendToBOPSFailure,
];

export const teamData = {
  teams: [
    {
      id: 1,
      name: "Test Council",
      theme: {
        logo: "https://example.com/logo.png",
        primaryColour: "#0000FF",
      },
    },
  ],
};
