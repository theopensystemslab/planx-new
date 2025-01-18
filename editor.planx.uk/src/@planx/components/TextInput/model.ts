import { string } from "yup";

import { BaseNodeData, parseBaseNodeData } from "../shared";

export type UserData = string;

export enum TextInputType {
  Short = "short",
  Long = "long",
  ExtraLong = "extraLong",
  Email = "email",
  Phone = "phone",
}

export const TEXT_LIMITS = {
  [TextInputType.Short]: 120,
  [TextInputType.Long]: 250,
  [TextInputType.ExtraLong]: 750,
} as const;

export const emailRegex =
  // eslint-disable-next-line
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const textInputValidationSchema = ({
  data: { type },
  required,
}: {
  data: TextInput;
  required: boolean;
}) =>
  string()
    .when([], {
      is: () => required,
      then: string().required("Enter your answer before continuing"),
      otherwise: string().notRequired(),
    })
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
        return `Your answer must be ${TEXT_LIMITS[type]} characters or fewer.`;
      })(),
      test: (value?: string) => {
        if (!required && !value) return true;
        if (!type) return true;

        if (type === TextInputType.Email) {
          return Boolean(value && emailRegex.test(value));
        }
        if (type === TextInputType.Phone) {
          return Boolean(value);
        }
        return Boolean(value && value.length <= TEXT_LIMITS[type]);
      },
    });

export interface TextInput extends BaseNodeData {
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
  ...parseBaseNodeData(data),
});
