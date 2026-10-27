import { z } from "zod";

import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";

interface LoginResponse {
  message: string;
}

export const loginSchema = z.object({
  body: z.object({
    email: z.email(),
  }),
});

export type Login = ValidatedRequestHandler<typeof loginSchema, LoginResponse>;
