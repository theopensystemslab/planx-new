import { z } from "zod";
import { ValidatedRequestHandler } from "../../../../shared/middleware/validate";
import {
  bopsSubmissionSchema,
  emailSubmissionSchema,
  sendSlackNotificationSchema,
  uniformSubmissionSchema,
} from "./schema";

interface SendSlackNotificationResponse {
  message: string;
  data?: string;
}

export type EventType = z.infer<
  typeof sendSlackNotificationSchema
>["query"]["type"];

export type BOPSBody = z.infer<typeof bopsSubmissionSchema>["body"];
export type BOPSEventData = BOPSBody["event"]["data"]["new"];

export type UniformBody = z.infer<typeof uniformSubmissionSchema>["body"];
export type UniformEventData = UniformBody["event"]["data"]["new"];

export type EmailBody = z.infer<typeof emailSubmissionSchema>["body"];
export type EmailEventData = EmailBody["event"]["data"]["new"];

export type EventData = BOPSEventData | UniformEventData | EmailEventData;

export type SendSlackNotification = ValidatedRequestHandler<
  typeof sendSlackNotificationSchema,
  SendSlackNotificationResponse
>;
