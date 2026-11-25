import { addDays, addMinutes, subDays, subMonths } from "date-fns";

import type { Submission, SubmissionSummary } from "./types";

const daysAgo = (n: number): string => subDays(new Date(), n).toISOString();
const monthsAgo = (n: number): string => subMonths(new Date(), n).toISOString();
const daysFromNow = (n: number): string => addDays(new Date(), n).toISOString();

// Anchor the event sequence to relative time so it never ages past the 28-day submission expiry window
const submissionBase = subDays(new Date(), 1);
const createdAtSeq = (minutes: number): string =>
  addMinutes(submissionBase, minutes).toISOString();

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

// multiple events for the same sessionId are for the SubmissionDetailModal tests
const sendToEmailSuccess: Submission = {
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  sessionId: "6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5",
  eventId: "2023508e-0fee-4726-8b04-5fcbba7d37c9",
  eventType: "Send to email",
  status: "Success",
  retry: true,
  response: { data: { message: "Success!" } },
  createdAt: createdAtSeq(3), // events happen in specified sequence to test groupEvents logic
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
  createdAt: createdAtSeq(4),
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
  createdAt: createdAtSeq(1),
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
  createdAt: createdAtSeq(0),
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
  createdAt: createdAtSeq(0),
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
  createdAt: createdAtSeq(1),
  flowName: "Report a planning breach",
  address: "3, CALVERT AVENUE, COLINDALE, LONDON, BARNET, NW9 4EW",
};

// GOV.UK Pay
export const mockPay = {
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  sessionId: "6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5",
  eventId: "pay-123",
  eventType: "Pay" as const,
  status: "Failed" as const,
  retry: false,
  response: {},
  createdAt: createdAtSeq(5),
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

// GOV.UK Pay
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

// Stripe Bacs Direct Debit
const bacsAwaitingRetrySummary: SubmissionSummary = {
  id: "1a2b3c4d-8888-4aaa-8aaa-888888888888",
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  flowName: "Apply for planning permission",
  address: "6, CALVERT AVENUE, COLINDALE, LONDON, BARNET, NW9 4EW",
  eventCreatedAt: daysAgo(3),
  eventType: "Pay",
  status: "Payment_Failed",
  payBy: daysFromNow(20),
  consolidatedStatus: "Awaiting payment retry",
};

const bacsRetryExpiredSummary: SubmissionSummary = {
  id: "1a2b3c4d-9999-4aaa-8aaa-999999999999",
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  flowName: "Apply for planning permission",
  address: "7, CALVERT AVENUE, COLINDALE, LONDON, BARNET, NW9 4EW",
  eventCreatedAt: daysAgo(30),
  eventType: "Pay",
  status: "Payment_Failed",
  payBy: daysAgo(1),
  consolidatedStatus: "Pay failed",
};

export const mockSubmissionsAllStatuses: SubmissionSummary[] = [
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
  bacsAwaitingRetrySummary,
  bacsRetryExpiredSummary,
];

export const mockSubmissionsPartialStatuses: SubmissionSummary[] = [
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

// Stripe
export const mockStripeSubmissionEvents: Submission[] = [
  {
    flowId: "d0744118-f902-4538-b439-573f4b42a727",
    sessionId: "sanitised-stripe-success-0000-0000-0000000",
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
    sessionId: "sanitised-stripe-success-0000-0000-0000000",
    eventId: "sanitised-stripe-0000-0000-000000000000",
    eventType: "Pay",
    status: "Succeeded",
    retry: false,
    response: { paymentId: "stripe-sanitised" },
    createdAt: monthsAgo(7),
    flowName: "Apply for planning permission",
    address: "No longer retained",
  },
  {
    flowId: "d0744118-f902-4538-b439-573f4b42a727",
    sessionId: "sanitised-stripe-success-0000-0000-0000000",
    eventId: "sanitised-stripe-init-0000-0000-000000000000",
    eventType: "Pay",
    status: "Initiated",
    retry: false,
    response: { paymentId: "stripe-sanitised" },
    createdAt: monthsAgo(7),
    flowName: "Apply for planning permission",
    address: "No longer retained",
  },
];

export const mockStripePaySuccess: Submission = {
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  sessionId: "6fcb873f-cc7f-4fc0-ad9d-b4148de7a3b5",
  eventId: "pay-456",
  eventType: "Pay",
  status: "Succeeded",
  retry: false,
  response: { data: { message: "Success!" } },
  createdAt: daysAgo(1),
  flowName: "Report a planning breach",
  address: "3, CALVERT AVENUE, COLINDALE, LONDON, BARNET, NW9 4EW",
};

const bacsEvent = {
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  sessionId: "bacs-awaiting-retry-0000-0000-00000000",
  retry: false,
  flowName: "Apply for planning permission",
  address: "6, CALVERT AVENUE, COLINDALE, LONDON, BARNET, NW9 4EW",
};

// Newest first, matching GET_SUBMISSION_EVENTS
export const mockBacsAwaitingRetryEvents: Submission[] = [
  {
    ...bacsEvent,
    eventId: "pi_bacs_failed",
    eventType: "Pay",
    status: "Payment_Failed",
    response: { status: "payment_failed", stripe_reference: "pi_bacs_failed" },
    createdAt: daysAgo(3),
    paymentMethod: "bacs_debit",
    payBy: daysFromNow(20),
  },
  {
    ...bacsEvent,
    eventId: "pi_bacs_processing",
    eventType: "Pay",
    status: "Processing",
    response: { status: "processing", stripe_reference: "pi_bacs_processing" },
    createdAt: daysAgo(8),
    paymentMethod: "bacs_debit",
    payBy: null,
  },
  {
    ...bacsEvent,
    eventId: "cs_bacs_initiated",
    eventType: "Pay",
    status: "Initiated",
    response: { status: "initiated", stripe_reference: "cs_bacs_initiated" },
    createdAt: daysAgo(8),
    paymentMethod: null,
    payBy: null,
  },
  {
    ...bacsEvent,
    eventId: "bacs-awaiting-retry-0000-0000-00000000",
    eventType: "Started session",
    status: "Success",
    response: {},
    createdAt: daysAgo(9),
  },
];
