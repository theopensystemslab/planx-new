import { SchemaOf, string } from "yup";

import { MoreInformation, parseMoreInformation } from "../shared";

export type UserData = string;

export enum TextInputType {
  Short = "short",
  Long = "long",
  ExtraLong = "extraLong",
  Email = "email",
  Phone = "phone",
}

export const TEXT_LIMITS = {
  [TextInputType.Short]: { limit: 120, showCharacterCount: false },
  [TextInputType.Long]: { limit: 250, showCharacterCount: true },
  [TextInputType.ExtraLong]: { limit: 750, showCharacterCount: true },
} as const;

export const emailRegex =
  // eslint-disable-next-line
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const userDataSchema = ({ type }: TextInput): SchemaOf<UserData> =>
  string()
    .required("Enter your answer before continuing")
    .test({
      name: "valid",
      message: (() => {
        if (!type) {
          return "Enter your answer before continuing";
        }
        if (type === TextInputType.Phone) {
          return "Enter a valid phone number.";
        }
        if (type === TextInputType.Email) {
          return "Enter an email address in the correct format, like name@example.com";
        }
        return `Your answer must be ${TEXT_LIMITS[type].limit} characters or fewer.`;
      })(),
      test: (value: string | undefined) => {
        if (!type) {
          return true;
        }
        if (type === TextInputType.Email) {
          return Boolean(value && emailRegex.test(value));
        }
        if (type === TextInputType.Phone) {
          return Boolean(value);
        }
        return Boolean(value && value.length <= TEXT_LIMITS[type].limit);
      },
    });

export interface TextInput extends MoreInformation {
  title: string;
  description?: string;
  fn?: string;
  type?: TextInputType;
}

export const parseTextInput = (
  data: Record<string, any> | undefined,
): TextInput => ({
  title: data?.title || "",
  description: data?.description,
  fn: data?.fn,
  type: data?.type,
  ...parseMoreInformation(data),
});
