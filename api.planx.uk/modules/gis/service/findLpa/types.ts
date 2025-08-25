import { z } from "zod";
import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";

export const findLpaSchema = z.object({
  query: z.object({
    lat: z.string().transform(Number).pipe(z.number()),
    lon: z.string().transform(Number).pipe(z.number()),
  }),
});

export type LocalPlanningAuthorityFeature = {
  name: string;
  entity: number;
  reference: string;
  "organisation-entity": string;
};

export interface Success {
  entities: LocalPlanningAuthorityFeature[];
  sourceRequest: string;
}

interface Failure {
  error: string;
}

export type FindLpaRequest = ValidatedRequestHandler<
  typeof findLpaSchema,
  Success | Failure
>;
