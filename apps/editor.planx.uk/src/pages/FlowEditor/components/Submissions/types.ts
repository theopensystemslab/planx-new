export interface Submission {
  flowId: string;
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
  address: string | null;
}

export interface SubmissionSummary {
  id: string;
  flowId: string;
  flowName: string;
  address: string | null;

  // aggregated/computed fields
  eventCount: number;
  mostRecentDate: string;
  mostRecentEventType: Submission["eventType"];
  mostRecentStatus: Submission["status"];
  status: "Success" | "Failed";

  // accumulate underlying events for modal
  events: Submission[];
}

export interface EventsLogProps {
  submissions: Submission[]; // TODO: remove extra type after removing GROUPED_SUBMISSIONS feature flag
  loading: boolean;
  error: Error | undefined;
  filterByFlow?: boolean;
}

export interface EventsLogGroupedProps {
  submissions: SubmissionSummary[];
  loading: boolean;
  error: Error | undefined;
  filterByFlow?: boolean;
}

export interface SubmissionsProps {
  flowSlug?: string;
}
