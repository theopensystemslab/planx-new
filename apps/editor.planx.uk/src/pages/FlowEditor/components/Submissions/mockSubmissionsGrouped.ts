import { subDays, subMonths } from "date-fns";

import type { Submission, SubmissionSummary } from "./types";

const daysAgo = (n: number): string => subDays(new Date(), n).toISOString();
const monthsAgo = (n: number): string => subMonths(new Date(), n).toISOString();

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

const paymentInProgressSummary: SubmissionSummary = {
  id: "1a2b3c4d-1111-4aaa-8aaa-111111111111",
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  flowName: "Apply for planning permission",
  address: "5, CALVERT AVENUE, COLINDALE, LONDON, BARNET, NW9 4EW",
  eventCreatedAt: daysAgo(1),
  eventType: "Pay",
  status: "Started",
  consolidatedStatus: "Payment in progress",
};

const sendingSummary: SubmissionSummary = {
  id: "1a2b3c4d-2222-4aaa-8aaa-222222222222",
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  flowName: "Apply for planning permission",
  address: "6, CALVERT AVENUE, COLINDALE, LONDON, BARNET, NW9 4EW",
  eventCreatedAt: daysAgo(1),
  eventType: "Pay",
  status: "Success",
  consolidatedStatus: "Sending",
};

const sendToUniformFailureSummary: SubmissionSummary = {
  id: "1a2b3c4d-3333-4aaa-8aaa-333333333333",
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  flowName: "Report a breach",
  address: "7, CALVERT AVENUE, COLINDALE, LONDON, BARNET, NW9 4EW",
  eventCreatedAt: daysAgo(2),
  eventType: "Submit to Uniform",
  status: "Failed (500)",
  consolidatedStatus: "Submit to Uniform failed",
};

const sendToEmailFailureSummary: SubmissionSummary = {
  id: "1a2b3c4d-4444-4aaa-8aaa-444444444444",
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  flowName: "Report a breach",
  address: "8, CALVERT AVENUE, COLINDALE, LONDON, BARNET, NW9 4EW",
  eventCreatedAt: daysAgo(2),
  eventType: "Send to email",
  status: "Failed (500)",
  consolidatedStatus: "Send to email failed",
};

const noAddressSendToEmailSummary: SubmissionSummary = {
  id: "aaaaaaaa-4444-4aaa-8aaa-444444444444",
  flowId: "d119c271-7495-4d81-8c59-973c75137262",
  flowName: "Attend a Public Inquiry",
  address: "Not applicable",
  eventCreatedAt: daysAgo(2),
  eventType: "Send to email",
  status: "Success",
  consolidatedStatus: "Success",
};

const uploadToAWSFailureSummary: SubmissionSummary = {
  id: "1a2b3c4d-5555-4aaa-8aaa-555555555555",
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  flowName: "Apply for a lawful development certificate",
  address: "9, CALVERT AVENUE, COLINDALE, LONDON, BARNET, NW9 4EW",
  eventCreatedAt: daysAgo(3),
  eventType: "Upload to AWS S3",
  status: "Failed (400)",
  consolidatedStatus: "Upload to AWS S3 failed",
};

const submitToIdoxFailureSummary: SubmissionSummary = {
  id: "1a2b3c4d-6666-4aaa-8aaa-666666666666",
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  flowName: "Apply for a lawful development certificate",
  address: "10, CALVERT AVENUE, COLINDALE, LONDON, BARNET, NW9 4EW",
  eventCreatedAt: daysAgo(3),
  eventType: "Submit to Idox Nexus",
  status: "Failed (502)",
  consolidatedStatus: "Submit to Idox Nexus failed",
};

const sanitisedApplicationSummary: SubmissionSummary = {
  id: "1a2b3c4d-7777-4aaa-8aaa-777777777777",
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  flowName: "Apply for planning permission",
  address: "No longer retained",
  eventCreatedAt: monthsAgo(7),
  eventType: "Submit to BOPS",
  status: "Success",
  consolidatedStatus: "Success",
};

export const mockSubmissionsGroupedAllStatuses: SubmissionSummary[] = [
  sendToEmailSuccessSummary,
  invitedToPaySummary,
  paymentInProgressSummary,
  sendingSummary,
  sendToBOPSFailureSummary,
  sendToUniformFailureSummary,
  sendToEmailFailureSummary,
  uploadToAWSFailureSummary,
  submitToIdoxFailureSummary,
  sanitisedApplicationSummary,
  noAddressSendToEmailSummary,
];

export const mockSubmissionsGroupedPartialStatuses: SubmissionSummary[] = [
  sendToEmailSuccessSummary,
  sendToEmailFailureSummary,
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

export const mockInvitedToPayEvents: Submission[] = [
  {
    flowId: "d0744118-f902-4538-b439-573f4b42a727",
    sessionId: "invited-to-pay-0000-0000-000000000000",
    eventId: "invite-event-0000-0000-000000000000",
    eventType: "Invited to pay",
    status: "Success",
    retry: false,
    response: { emailSentTo: "applicant@example.com" },
    createdAt: daysAgo(2),
    flowName: "Apply for a lawful development certificate",
    address: "11, CALVERT AVENUE, COLINDALE, LONDON, BARNET, NW9 4EW",
  },
];

export const mockUnresolvedFailureEvents: Submission[] = [
  {
    flowId: "d0744118-f902-4538-b439-573f4b42a727",
    sessionId: "unresolved-failure-0000-0000-00000000",
    eventId: "unresolved-bops-0000-0000-000000000000",
    eventType: "Submit to BOPS",
    status: "Failed (500)",
    retry: false,
    response: { data: { message: "Internal server error" } },
    createdAt: daysAgo(1),
    flowName: "Apply for planning permission",
    address: "12, CALVERT AVENUE, COLINDALE, LONDON, BARNET, NW9 4EW",
  },
  {
    flowId: "d0744118-f902-4538-b439-573f4b42a727",
    sessionId: "unresolved-failure-0000-0000-00000000",
    eventId: "unresolved-pay-0000-0000-000000000000",
    eventType: "Pay",
    status: "Success",
    retry: false,
    response: { paymentId: "gov-pay-unresolved" },
    createdAt: daysAgo(2),
    flowName: "Apply for planning permission",
    address: "12, CALVERT AVENUE, COLINDALE, LONDON, BARNET, NW9 4EW",
  },
];

export const mockSanitisedSuccessEvents: Submission[] = [
  {
    flowId: "d0744118-f902-4538-b439-573f4b42a727",
    sessionId: "sanitised-success-0000-0000-0000000",
    eventId: "sanitised-bops-0000-0000-000000000000",
    eventType: "Submit to BOPS",
    status: "Success",
    retry: false,
    response: { data: { body: { message: "Application received" } } },
    createdAt: monthsAgo(7),
    flowName: "Apply for planning permission",
    address: "No longer retained",
  },
  {
    flowId: "d0744118-f902-4538-b439-573f4b42a727",
    sessionId: "sanitised-success-0000-0000-0000000",
    eventId: "sanitised-pay-0000-0000-000000000000",
    eventType: "Pay",
    status: "Success",
    retry: false,
    response: { paymentId: "gov-pay-sanitised" },
    createdAt: monthsAgo(7),
    flowName: "Apply for planning permission",
    address: "No longer retained",
  },
];
