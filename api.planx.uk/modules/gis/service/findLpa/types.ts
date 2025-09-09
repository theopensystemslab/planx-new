import { z } from "zod";
import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";

// UK: https://spelunker.whosonfirst.org/id/85633159
const UK_BBOX: number[] = [-8.649996, 49.864632, 1.768975, 60.860867];

export const findLpaSchema = z.object({
  query: z.object({
    lon: z
      .string()
      .transform(Number)
      .pipe(z.number())
      .refine((lon) => lon >= UK_BBOX[0] && lon <= UK_BBOX[2]),
    lat: z
      .string()
      .transform(Number)
      .pipe(z.number())
      .refine((lat) => lat >= UK_BBOX[1] && lat <= UK_BBOX[3]),
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
