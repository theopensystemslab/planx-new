export interface Submission {
  flowId: string;
  sessionId: string;
  eventId: string;
  eventType:
    | "Pay"
    | "Submit to BOPS"
    | "Submit to Uniform"
    | "Send to email"
    | "Upload to AWS S3"
    | "Upload to AWS S3 (no notification)"
    | "Submit to Idox Nexus"
    | "Started session"
    | "Invited to pay";
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

export interface GroupedEvent {
  sessionId: Submission["sessionId"];
  eventId: Submission["eventId"];
  events: Attempt[];
}

export type Attempt = {
  eventType: Submission["eventType"] | SessionEvent;
  createdAt: Submission["createdAt"];
  retry: Submission["retry"];
  response: Submission["response"];
  status: Submission["status"];
};

export type SessionEvent = "Invited to pay" | "Started session";

export interface SubmissionSummary {
  id: string;
  flowId: string;
  flowName: string;
  address: string | null;
  eventCreatedAt: string;
  eventType: Submission["eventType"];
  status: Submission["status"];
  consolidatedStatus?: string;
}

export interface EventsLogProps {
  submissions: SubmissionSummary[];
  loading: boolean;
  error: Error | undefined;
  filterByFlow?: boolean;
}

export interface SubmissionsProps {
  flowSlug?: string;
}

export type GetTeamLogoQuery = {
  teams: {
    theme: {
      logo: string;
      primaryColour: string;
    };
    id: number;
    name: string;
  }[];
};

export type GetTeamLogoVariables = {
  teamSlug: string;
};
