import { gql } from "graphql-request";

import { Passport } from "@opensystemslab/planx-core";

import { $api } from "../../../../client/index.js";
import type { Operation } from "../sanitiseApplicationData/types.js";

/**
 * ALLOW_LIST should stay in sync with
 *   apps/editor.planx.uk/src/pages/FlowEditor/lib/analyticsProvider
 *
 * If appending values to ALLOW_LIST please also update the
 *  `analytics_summary` & `submission_services_summary` views to extract the value into its own column
 *
 * Please also ensure your migration ends with `GRANT SELECT ON public.{VIEW_NAME} TO metabase_read_only`
 *  so that Metabase picks up the new columns
 */
const ALLOW_LIST = [
  "application.declaration.connection",
  "application.fastTrack",
  "application.fee.serviceCharge",
  "application.information.harmful",
  "application.information.sensitive",
  "application.type",
  "drawBoundary.action",
  "_feedback",
  "findProperty.action",
  "_overrides",
  "permittedDevelopmentCheck",
  "planningConstraints.action",
  "project.reportType.multiple",
  "property.constraints.planning",
  "property.type",
  "property.type.userProvided",
  "propertyInformation.action",
  "proposal.description",
  "proposal.projectType",
  "rab.exitReason",
  "report.projectType",
  "send.analytics.userAgent",
  "send.analytics.referrer",
  "service.type",
  "usedFOIYNPP",
  "user.role",
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
