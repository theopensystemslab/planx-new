import { string } from "yup";

import { BaseNodeData, parseBaseNodeData } from "../shared";

export type UserData = string;

export enum TextInputType {
  Short = "short",
  Long = "long",
  ExtraLong = "extraLong",
  Email = "email",
  Phone = "phone",
  Custom = "custom",
}

export const getTextLimit = (
  type: TextInputType | undefined,
  customLength?: number,
): number => {
  if (type === TextInputType.Custom && customLength) {
    return customLength;
  }
  return type ? TEXT_LIMITS[type] : 0;
};

export const getRegex = (
  type: TextInputType | undefined,
  customRegex?: string,
): RegExp => {
  if (type === TextInputType.Custom && customRegex) {
    try {
      return new RegExp(customRegex);
    } catch {
      return /.*/; // fallback to match anything if invalid regex
    }
  }
  return type ? REGEX[type] : /.*/;
};

export const TEXT_LIMITS = {
  [TextInputType.Short]: 120,
  [TextInputType.Long]: 250,
  [TextInputType.ExtraLong]: 750,
  [TextInputType.Custom]: 120,
  [TextInputType.Email]: 320,
  [TextInputType.Phone]: 16,
} as const;

export const emailRegex =
  // eslint-disable-next-line
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const REGEX = {
  [TextInputType.Short]: /.*/,
  [TextInputType.Long]: /.*/,
  [TextInputType.ExtraLong]: /.*/,
  [TextInputType.Custom]: /.*/,
  [TextInputType.Email]: emailRegex,
  [TextInputType.Phone]: /.*/,
} as const;

export const textInputValidationSchema = ({
  data: { type, customLength, customRegex, customExample },
  required,
}: {
  data: TextInput;
  required: boolean;
}) =>
  string()
    .when([], {
      is: () => required,
      then: string().trim().required("Enter your answer before continuing"),
      otherwise: string().notRequired(),
    })
    .test({
      name: "valid",
      message: (() => {
        if (!type) {
          return "Enter your answer before continuing";
        }

        const limit = getTextLimit(type, customLength);

        if (type === TextInputType.Phone) {
          return `Enter a valid phone number (maximum ${limit} characters).`;
        }
        if (type === TextInputType.Email) {
          return `Enter an email address in the correct format, like name@example.com.`;
        }
        if (type === TextInputType.Custom && customRegex) {
          return customExample
            ? `Enter the information in the correct format, like ${customExample}.`
            : `Enter the information in the correct format.`;
        }
        return `Your answer must be ${limit} characters or fewer.`;
      })(),
      test: (value?: string) => {
        if (!value) return true;
        if (!type) return true;
        if (!(value && value.length <= getTextLimit(type, customLength))) {
          return false;
        }

        const regex = getRegex(type, customRegex);
        if (type === TextInputType.Custom && customRegex) {
          return regex.test(value);
        }
        if (type === TextInputType.Email) {
          return regex.test(value);
        }
        if (type === TextInputType.Phone) {
          return value.length > 0;
        }
        return true;
      },
    });

export interface TextInput extends BaseNodeData {
  title: string;
  description?: string;
  fn?: string;
  type?: TextInputType;
  customLength?: number;
  customRegex?: string;
  customExample?: string;
}

export const parseTextInput = (
  data: Record<string, any> | undefined,
): TextInput => ({
  title: data?.title || "",
  description: data?.description,
  fn: data?.fn,
  type: data?.type,
  customLength: data?.customLength,
  customRegex: data?.customRegex,
  customExample: data?.customExample,
  ...parseBaseNodeData(data),
});
