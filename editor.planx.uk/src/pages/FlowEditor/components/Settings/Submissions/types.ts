import { Submission } from "./types";

export interface Submission {
  sessionId: string;
  eventId: string;
  eventType:
    | "Pay"
    | "Submit to BOPS"
    | "Submit to Uniform"
    | "Send to email"
    | "Upload to AWS S3";
  status?:
    | "Success"
    | "Failed (500)" // Hasura scheduled event status codes
    | "Failed (502)"
    | "Failed (503)"
    | "Failed (504)"
    | "Failed (400)"
    | "Failed (401)"
    | "Started" // Payment status enum codes (excluding "Created")
    | "Submitted"
    | "Capturable"
    | "Failed"
    | "Cancelled"
    | "Error"
    | "Unknown";
  retry: boolean;
  response: Record<string, any>;
  createdAt: string;
  flowName: string;
}
export interface GetSubmissionsResponse {
  submissions: Submission[];
  loading: boolean;
  error: Error | undefined;
}
export interface SubmissionsProps {
  flowSlug?: string;
}
