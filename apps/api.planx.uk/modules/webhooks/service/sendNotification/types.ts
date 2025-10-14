import type { z } from "zod";
import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";
import type {
  bopsSubmissionSchema,
  emailSubmissionSchema,
  s3SubmissionSchema,
  sendSlackNotificationSchema,
  uniformSubmissionSchema,
} from "./schema.js";

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

export type S3Body = z.infer<typeof s3SubmissionSchema>["body"];
export type S3EventData = S3Body["event"]["data"]["new"];

export type EventData =
  | BOPSEventData
  | UniformEventData
  | EmailEventData
  | S3EventData;

export type SendSlackNotification = ValidatedRequestHandler<
  typeof sendSlackNotificationSchema,
  SendSlackNotificationResponse
>;
