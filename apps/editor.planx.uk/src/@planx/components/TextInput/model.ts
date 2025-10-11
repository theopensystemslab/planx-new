import { richText } from "lib/yupExtensions";
import { mixed, object, string } from "yup";

import { BaseNodeData, baseNodeDataValidationSchema, parseBaseNodeData } from "../shared";

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

export const editorValidationSchema = baseNodeDataValidationSchema.concat(
  object({
    title: string().required(),
    description: richText(),
    fn: string().nullable(),
    type: mixed().oneOf([
      "short",
      "long",
      "extraLong",
      "email",
      "phone",
      "custom"
    ]),
    customLength: string().when("type", {
      is: "custom",
      then: string()
        .required("Enter a number")
        .test({
          name: "check for positive number",
          message: "Character limit must be greater than 0",
          test: (value?: string) => {
            if (!value) return true;
            const num = Number(value);
            return num > 0;
          },
        }),
    }),
  }));

export const textInputValidationSchema = ({
  data: { type, customLength },
  required,
}: {
  data: TextInput;
  required: boolean;
}) => {
  const limit = getTextLimit(type, customLength);
  return string()
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

        if (type === TextInputType.Phone) {
          return `Enter a valid phone number (maximum ${limit} characters)`;
        }
        if (type === TextInputType.Email) {
          return `Enter an email address in the correct format, like name@example.com`;
        }
        return `Your answer must be ${limit} characters or fewer`;
      })(),
      test: (value?: string) => {
        if (!value) return true;
        if (!type) return true;
        if (!(value && value.length <= limit)) {
          return false;
        }

        if (type === TextInputType.Email) {
          return emailRegex.test(value);
        }
        if (type === TextInputType.Phone) {
          return value.length > 0;
        }
        return true;
      },
    });
};

export interface TextInput extends BaseNodeData {
  title: string;
  description?: string;
  fn?: string;
  type?: TextInputType;
  customLength?: number;
}

export const parseTextInput = (
  data: Record<string, any> | undefined,
): TextInput => ({
  title: data?.title || "",
  description: data?.description,
  fn: data?.fn,
  type: data?.type ?? TextInputType.Short,
  customLength: data?.customLength,
  ...parseBaseNodeData(data),
});
