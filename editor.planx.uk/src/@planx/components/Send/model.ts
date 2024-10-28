import { SendIntegration } from "@opensystemslab/planx-core/types";

import type { Store } from "../../../pages/FlowEditor/lib/store";
import { BaseNodeData, parseBaseNodeData } from "../shared";

type CombinedEventsPayload = Partial<Record<SendIntegration, EventPayload>>;

interface EventPayload {
  localAuthority: string;
  body: {
    sessionId: string;
  };
}

export interface Send extends BaseNodeData {
  title: string;
  destinations: SendIntegration[];
}

export const DEFAULT_TITLE = "Send";
export const DEFAULT_DESTINATION = "email";

export const parseContent = (data: Record<string, any> | undefined): Send => ({
  ...parseBaseNodeData(data),
  title: data?.title || DEFAULT_TITLE,
  destinations: data?.destinations || [DEFAULT_DESTINATION],
});

const isSendingToUniform = (
  payload: CombinedEventsPayload,
): payload is CombinedEventsPayload & { uniform: EventPayload } =>
  "uniform" in payload;

export function getCombinedEventsPayload({
  destinations,
  teamSlug,
  passport,
  sessionId,
}: {
  destinations: SendIntegration[];
  teamSlug: string;
  passport: Store.Passport;
  sessionId: string;
}) {
  const payload: CombinedEventsPayload = {};

  // Construct payload containing details for each send destination
  destinations.forEach((destination) => {
    payload[destination] = {
      localAuthority: teamSlug,
      body: { sessionId },
    };
  });

  // Bucks has 3 instances of Uniform for 4 legacy councils, set teamSlug to pre-merger council name
  const isUniformOverrideRequired =
    isSendingToUniform(payload) && teamSlug === "buckinghamshire";

  if (isUniformOverrideRequired) {
    let uniformTeamSlug = teamSlug;

    uniformTeamSlug = passport.data?.["property.localAuthorityDistrict"]
      ?.filter((name: string) => name !== "Buckinghamshire")[0]
      ?.toLowerCase()
      ?.replace(/\W+/g, "-");

    // South Bucks & Chiltern share an Idox connector, route addresses in either to Chiltern
    if (uniformTeamSlug === "south-bucks") {
      uniformTeamSlug = "chiltern";
    }

    // Apply override
    payload["uniform"].localAuthority = uniformTeamSlug;
  }

  return payload;
}
