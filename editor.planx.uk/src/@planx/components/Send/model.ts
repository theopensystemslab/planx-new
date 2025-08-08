import { SendIntegration } from "@opensystemslab/planx-core/types";
import { array, mixed, object, SchemaOf, string } from "yup";

import type { Store } from "../../../pages/FlowEditor/lib/store";
import {
  BaseNodeData,
  baseNodeDataValidationSchema,
  parseBaseNodeData,
} from "../shared";

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

export const parseSend = (data: Record<string, any> | undefined): Send => ({
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

  return payload;
}

export const validationSchema: SchemaOf<Send> =
  baseNodeDataValidationSchema.concat(
    object({
      title: string().required(),
      destinations: array(
        mixed().oneOf(["email", "bops", "uniform", "s3", "idox"]),
      ).min(1, "Select at least one destination"),
    }),
  );
