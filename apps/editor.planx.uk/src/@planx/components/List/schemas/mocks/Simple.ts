import type { Schema } from "@planx/components/shared/Schema/model";
import { TextInputType } from "@planx/components/TextInput/model";

import type { Props } from "../../Public";

/**
 * Lightweight 2-field schema for testing structural list behaviour
 * (adding, removing, editing, cancelling items).
 *
 * Field labels deliberately match the Zoo schema's name/email fields so
 * that assertions like getByLabelText(/What's their name?/) still work.
 */
export const Simple: Schema = {
  type: "Animal",
  fields: [
    {
      type: "text",
      data: {
        title: "What's their name?",
        fn: "name",
        type: TextInputType.Short,
      },
    },
    {
      type: "text",
      data: {
        title: "What's their email address?",
        fn: "email.address",
        type: TextInputType.Email,
      },
    },
  ],
  min: 1,
  max: 3,
} as const;

export const mockSimpleProps: Props = {
  fn: "mockFn",
  schema: Simple,
  schemaName: "Animal",
  title: "Mock Title",
  description: "Mock description",
};
