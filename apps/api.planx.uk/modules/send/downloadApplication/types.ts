import z from "zod";
import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";

export const useAccessTokenAuthSchema = z.object({
  headers: z.object({
    authorization: z
      .string({ message: "Authorization headers are required" })
      .startsWith("Bearer ", "Invalid token format")
      .transform((val) => val.replace("Bearer ", "")),
  }),
});

interface AuthFailure {
  error: "INVALID_ACCESS_TOKEN" | "REVOKED_ACCESS_TOKEN" | "EXPIRED_ACCESS_TOKEN"
}

type DownloadApplicationLocals = {
  sessionId: string;
};

export type UseAccessTokenAuth = ValidatedRequestHandler<
  typeof useAccessTokenAuthSchema,
  null | AuthFailure,
  Partial<DownloadApplicationLocals>
>;

export type DownloadApplication = ValidatedRequestHandler<
  typeof useAccessTokenAuthSchema,
  Buffer,
  DownloadApplicationLocals
>;
