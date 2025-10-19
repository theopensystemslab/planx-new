import { Session } from "types";

export interface SendSaveEmailResponse {
  expiryDate: string;
}

/**
 * Matches the body created by a Hasura scheduled event - see tables.yml
 */
export interface SessionAuthPayload {
  payload: {
    email: string | undefined;
    sessionId: string;
  };
}

export interface SendResumeEmailPayload {
  payload: {
    email: string;
    teamSlug: string;
  };
}

export interface ReconciliationResponse {
  message: string;
  changesFound: boolean | null;
  alteredSectionIds?: string[];
  reconciledSessionData: Omit<Session, "passport">;
}
