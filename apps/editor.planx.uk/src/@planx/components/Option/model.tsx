import { Flag } from "@opensystemslab/planx-core/types";
import { array, mixed, object, string } from "yup";

/**
 * The Option node doesn't have a direct Editor or Public interface
 *  - Editor: Controlled and authored via the parent Question component
 *  - Public: Viewed and selected via the parent Question component
 *
 * XXX: Maps to ComponentType.Answer
 */
export interface Option {
  id: string;
  data: {
    description?: string;
    flags?: Array<Flag["value"]>;
    img?: string;
    text: string;
    val?: string;
    exclusive?: true;
  };
}

export const optionValidationSchema = object({
  id: string(),
  data: object({
    description: string(),
    flags: array(string()),
    img: string(),
    text: string().required().trim(),
    val: string(),
    exclusive: mixed().oneOf([true, undefined]),
  }),
});
