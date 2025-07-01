import { z } from "zod";
import type { ValidatedRequestHandler } from "../../shared/middleware/validate.js";

interface LoginResponse {
  message: string;
}

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export type Login = ValidatedRequestHandler<typeof loginSchema, LoginResponse>;

export interface LPSApplication {
  id: string;
  updatedAt: string;
  submittedAt: string | null;
  service: {
    name: string;
    slug: string;
  };
  team: {
    name: string;
    slug: string;
    domain: string | null;
  };
  url: string;
}

interface ApplicationsResponse {
  applications: LPSApplication[];
}

export const applicationsSchema = z.object({
  body: z.object({
    email: z.string().email(),
    token: z.string().uuid(),
  }),
});

export type Applications = ValidatedRequestHandler<
  typeof applicationsSchema,
  ApplicationsResponse
>;
