import { z } from "zod";

export const bopsSubmissionSchema = z.object({
  body: z.object({
    event: z.object({
      data: z.object({
        new: z.object({
          bops_id: z.string(),
          destination_url: z.string(),
        }),
      }),
    }),
  }),
  query: z.object({
    type: z.literal("bops-submission"),
  }),
});

export const uniformSubmissionSchema = z.object({
  body: z.object({
    event: z.object({
      data: z.object({
        new: z.object({
          submission_reference: z.string(),
          response: z.object({
            organisation: z.string(),
          }),
        }),
      }),
    }),
  }),
  query: z.object({
    type: z.literal("uniform-submission"),
  }),
});

export const emailSubmissionSchema = z.object({
  body: z.object({
    event: z.object({
      data: z.object({
        new: z.object({
          session_id: z.string(),
          team_slug: z.string(),
          request: z.object({
            personalisation: z.object({
              serviceName: z.string(),
            }),
          }),
        }),
      }),
    }),
  }),
  query: z.object({
    type: z.literal("bops-submission"),
  }),
});

export const sendSlackNotificationSchema = z.union([
  bopsSubmissionSchema,
  uniformSubmissionSchema,
  emailSubmissionSchema,
]);
