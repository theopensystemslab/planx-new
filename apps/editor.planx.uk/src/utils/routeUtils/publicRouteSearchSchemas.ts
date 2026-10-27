import { z } from "zod";

const basePublicSearchSchema = z.object({
  sessionId: z.string().optional(),
  email: z.string().optional(),
});

// In practice, `/preview` and `/draft` routes are public but only accessed by editors or testers
//   they do not support Save & Return nor integrations like Pay (therefore no sessionId nor email param)
const nonSaveAndReturnSearchSchema = z.object({
  sessionId: z.undefined().optional(),
  email: z.undefined().optional(),
});

// Search schemas
export const publicRouteSearchSchemas = {
  published: basePublicSearchSchema.extend({
    analytics: z.boolean().optional(),
    stripeSessionId: z.string().optional(),
    cancelled: z.coerce.boolean().optional(),
  }),
  preview: nonSaveAndReturnSearchSchema,
  draft: nonSaveAndReturnSearchSchema,
  pay: basePublicSearchSchema,
  download: basePublicSearchSchema,
};

// Inferred types from zod schemas
export type PublicRouteSearchParams = {
  [K in keyof typeof publicRouteSearchSchemas]: z.infer<
    (typeof publicRouteSearchSchemas)[K]
  >;
};
