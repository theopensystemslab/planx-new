import { SchemaOf, string } from "yup";

import { MoreInformation, parseMoreInformation } from "../shared";

export type UserData = string;

export enum TextInputType {
  Short = "short",
  Long = "long",
  Email = "email",
  Phone = "phone",
}

const emailRegex =
  // eslint-disable-next-line
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const userDataSchema = (type?: TextInputType): SchemaOf<UserData> =>
  string()
    .required("Enter your answer")
    .test({
      name: "valid",
      message: (() => {
        if (!type) {
          return "Enter your answer.";
        }
        if (type === TextInputType.Short) {
          return "Your answer must be 120 characters or fewer.";
        }
        if (type === TextInputType.Long) {
          return "Your answer must be 250 characters or fewer.";
        }
        if (type === TextInputType.Email) {
          return "Enter a valid email.";
        }
        if (type === TextInputType.Phone) {
          return "Enter a valid phone number.";
        }
      })(),
      test: (value: string | undefined) => {
        if (!type) {
          return true;
        }
        if (type === TextInputType.Short) {
          return Boolean(value && value.length < 120);
        }
        if (type === TextInputType.Long) {
          return Boolean(value && value.length < 250);
        }
        if (type === TextInputType.Email) {
          return Boolean(value && emailRegex.test(value));
        }
        if (type === TextInputType.Phone) {
          return Boolean(value);
        }
        return false;
      },
    });

export interface TextInput extends MoreInformation {
  title: string;
  description?: string;
  placeholder?: string;
  fn?: string;
  type?: TextInputType;
}

export const parseTextInput = (
  data: Record<string, any> | undefined
): TextInput => ({
  title: data?.title || "",
  description: data?.description,
  placeholder: data?.placeholder,
  fn: data?.fn,
  type: data?.type,
  ...parseMoreInformation(data),
});
