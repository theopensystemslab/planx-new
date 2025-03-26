import { Submission } from "./types";

const sendToEmailSuccess: Submission = {
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  sessionId: "126ec0c4-12f2-1209-aa09-11294ec3ee12",
  eventId: "c8uu7c6a-7ea9-412d-9c4d-8f08039e1212",
  eventType: "Send to email",
  status: "Success",
  retry: false,
  response: {
    data: {
      body: '{"message":"Successfully sent \\"Submit\\" email"}',
      status: 200,
    },
    type: "webhook_response",
    version: "1",
  },
  createdAt: "2024-01-12T12:17:42.275655+00:00",
  flowName: "Dsn impact metrics",
};

const sendToBOPSFailure: Submission = {
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  sessionId: "556ec0c4-55f2-7709-aa09-15599ec3ee99",
  eventId: "11fef8d6-336b-45ce-899d-e4ef0a307699",
  eventType: "Submit to BOPS",
  status: "Failed (500)",
  retry: false,
  response: {
    data: {
      message:
        '{"error":"Sending to BOPS failed (camden), this error has been logged"}',
    },
    type: "client_error",
    version: "1",
  },
  createdAt: "2024-01-12T12:18:12.805747+00:00",
  flowName: "Apply for a lawful development certificate",
};

const jsonError: Submission = {
  flowId: "d0744118-f902-4538-b439-573f4b42a727",
  sessionId: "556ec0c4-55f2-7709-aa09-15599ec3ee99",
  eventId: "11fef8d6-336b-45ce-899d-e4ef0a307699",
  eventType: "Submit to BOPS",
  status: "Failed (500)",
  retry: false,
  response: {
    data: "Invalid JSON",
    type: "client_error",
    version: "1",
  },
  createdAt: "2024-01-12T12:18:12.805747+00:00",
  flowName: "Report a breach",
};

export const mockSubmissions: Submission[] = [
  sendToEmailSuccess,
  sendToBOPSFailure,
  jsonError,
];
