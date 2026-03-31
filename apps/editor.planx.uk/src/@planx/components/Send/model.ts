import { SendIntegration } from "@opensystemslab/planx-core/types";
import { CombinedEventsPayload } from "lib/api/send/types";
import { array, mixed, object, SchemaOf, string } from "yup";

import {
  BaseNodeData,
  baseNodeDataValidationSchema,
  parseBaseNodeData,
} from "../shared";

export interface Send extends BaseNodeData {
  title: string;
  destinations: SendIntegration[];
  submissionEmailId?: string;
  newEmail?: string;
}

export const DEFAULT_TITLE = "Send";
export const DEFAULT_DESTINATION = "email";

export const parseSend = (data: Record<string, any> | undefined): Send => ({
  ...parseBaseNodeData(data),
  title: data?.title || DEFAULT_TITLE,
  destinations: data?.destinations || [DEFAULT_DESTINATION],
  submissionEmailId: data?.submissionEmailId || "",
});

export function getCombinedEventsPayload({
  destinations,
  teamSlug,
  sessionId,
}: {
  destinations: SendIntegration[];
  teamSlug: string;
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

export const validateSchema = (existingEmails: string[]) =>
  baseNodeDataValidationSchema.concat(
    object({
      title: string().required(),
      destinations: array(
        mixed().oneOf(["email", "bops", "uniform", "s3", "fme", "idox"]),
      ).min(1, "Select at least one destination"),
      submissionEmailId: string().when("destinations", {
        is: (destinations: SendIntegration[]) => destinations.includes("email"),
        then: string().required(
          "Submission email is required when 'send to email' is selected.",
        ),
      }),
      newEmail: string()
        .email("Please enter a valid email address.")
        .when("submissionEmailId", {
          is: (submissionEmailId: string) => submissionEmailId === "new-email",
          then: string()
            .required("Please enter a new submission email.")
            .test(
              "is-unique",
              "Please enter a unique email address.",
              function (value) {
                if (!value) return true;
                return !existingEmails.includes(value);
              },
            ),
        }),
    }),
  );
