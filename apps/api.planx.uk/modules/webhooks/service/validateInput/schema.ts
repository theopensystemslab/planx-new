import { z } from "zod";

import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";
import { HTMLSanitiser, isObjectValid, makeIsCleanHTML } from "./utils.js";

// Definition: https://hasura.io/docs/latest/schema/postgres/input-validations/#response
type HasuraValidateInputResponse = undefined | { message: string };

// Definition: https://hasura.io/docs/latest/schema/postgres/input-validations/#request
// Abstract base type that can be merged with specific schemas for data validation
const hasuraValidateInputRequestSchema = z.object({
  body: z.object({
    data: z.object({
      input: z.array(z.record(z.string(), z.unknown())),
    }),
  }),
});

type HasuraValidateInputRequest = z.infer<
  typeof hasuraValidateInputRequestSchema
>;

interface IsCleanJSONBRequest {
  body: {
    isClean: boolean;
  };
}

type isCleanJSONBSchema = z.ZodType<
  IsCleanJSONBRequest,
  z.ZodTypeDef,
  HasuraValidateInputRequest
>;

/**
 * Schema which iterates over values of a JSONB column
 * Checks using DOMPurify to ensure that user-submitted HTML is clean
 * Fails fast - will reject on first instance of unclean HTML
 */
export const isCleanJSONBSchema: isCleanJSONBSchema =
  hasuraValidateInputRequestSchema.transform((original) => {
    // Instantiate a single instance per-request to avoid memory leaks
    const sanitiser = new HTMLSanitiser();

    try {
      const isCleanHTML = makeIsCleanHTML(sanitiser);
      const isClean = original.body.data.input.every((input) =>
        isObjectValid(input, isCleanHTML),
      );
      return { body: { isClean } };
    } finally {
      sanitiser.close();
    }
  });

export type IsCleanJSONBController = ValidatedRequestHandler<
  typeof isCleanJSONBSchema,
  HasuraValidateInputResponse
>;
