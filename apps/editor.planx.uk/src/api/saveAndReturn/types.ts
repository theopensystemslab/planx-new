export interface SendSaveEmailResponse {
  expiryDate: string;
}

/**
 * Body of request posted to /send-email endpoint
 * XXX: Matches the body created by a Hasura scheduled event - see tables.yml
 */
export interface SendEmailPayload {
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
