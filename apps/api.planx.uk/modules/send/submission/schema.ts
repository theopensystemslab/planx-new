import z from "zod";

export const submissionSchema = z.object({
  params: z.object({
    sessionId: z.string().uuid(),
  }),
});
