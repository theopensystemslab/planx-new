import { gql } from "graphql-request";

import { Passport } from "@opensystemslab/planx-core";
import { $api } from "../../../../client";
import { Operation } from "../sanitiseApplicationData/types";

// ALLOW_LIST should stay in sync with
//   editor.planx.uk/src/pages/FlowEditor/lib/analyticsProvider
const ALLOW_LIST = [
  "proposal.projectType",
  "application.declaration.connection",
];

export const getAnalyzeSessionOperations = (): Operation[] => [
  trackAllowListAnswers,
];

/**
 * Parse allow-list answers from submitted, to-be sanitised session data
 *   and write to a separate, un-sanitised field for analytics over all time
 */
export const trackAllowListAnswers: Operation = async () => {
  const updatedSessionIds: string[] = [];

  const sessionIds = await getSubmittedUnAnalyzedSessionIds();
  for (const sessionId of sessionIds) {
    const session = await $api.session.find(sessionId);
    if (!session) {
      throw Error(`Unable to find session matching id ${sessionId}`);
    }

    const passport = new Passport(session.data.passport);
    const allowListAnswers: Passport["data"] = {};
    ALLOW_LIST.forEach((fn) => {
      if (passport.data?.[fn]) {
        allowListAnswers[fn] = passport.data?.[fn];
      }
    });

    const id = await updateLowcalSessionAllowListAnswers(
      sessionId,
      allowListAnswers,
    );
    if (id) updatedSessionIds.push(id);
  }

  return updatedSessionIds;
};

/**
 * Return list of session IDs which are ready for analytics
 */
export const getSubmittedUnAnalyzedSessionIds = async (): Promise<string[]> => {
  const query = gql`
    query GetSubmittedUnAnalyzedSessionIds {
      lowcal_sessions(
        where: {
          submitted_at: { _is_null: false }
          sanitised_at: { _is_null: true }
          allow_list_answers: { _is_null: true }
        }
      ) {
        id
      }
    }
  `;

  const {
    lowcal_sessions: sessions,
  }: { lowcal_sessions: Record<"id", string>[] } =
    await $api.client.request(query);
  const sessionIds = sessions.map((session) => session.id);
  return sessionIds;
};

/**
 * Populate lowcal_sessions.allow_list_answers
 * This field will not be sanitised and is exposed in the submission_services_summary database view
 */
export const updateLowcalSessionAllowListAnswers = async (
  sessionId: string,
  allowListAnswers: Passport["data"],
): Promise<string> => {
  try {
    const mutation = gql`
      mutation UpdateLowcalSessionAllowListAnswers(
        $sessionId: uuid!
        $allowListAnswers: jsonb
      ) {
        update_lowcal_sessions_by_pk(
          pk_columns: { id: $sessionId }
          _set: { allow_list_answers: $allowListAnswers }
        ) {
          id
        }
      }
    `;
    const id: string = await $api.client.request(mutation, {
      sessionId,
      allowListAnswers,
    });
    return id;
  } catch (error) {
    throw new Error(
      `Error updating allow_list_answers for lowcal_session ${sessionId}`,
    );
  }
};
