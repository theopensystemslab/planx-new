import type { z } from "zod";

import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";

export type QueryResult = string[] | string;

export type Operation = () => Promise<QueryResult>;

export type SanitiseApplicationData = ValidatedRequestHandler<
  z.ZodUndefined,
  { message: string }
>;
