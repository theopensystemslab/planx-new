import type { SchemaOf } from "yup";
import { object, string } from "yup";

import { MoreInformation, parseMoreInformation } from "../shared";

export type Contact = {
  title?: string;
  firstName: string;
  lastName: string;
  organisation?: string;
  phone: string;
  email: string;
};

export const userDataSchema: SchemaOf<Contact> = object({
  title: string(),
  firstName: string().required("Enter a first name"),
  lastName: string().required("Enter a last name"),
  organisation: string(),
  phone: string().required("Enter a phone number"),
  email: string()
    .email(
      "Enter an email address in the correct format, like name@example.com"
    )
    .required("Enter an email address"),
});

export interface ContactInput extends MoreInformation {
  title: string;
  description?: string;
  fn?: string;
}

export const parseContactInput = (
  data: Record<string, any> | undefined
): ContactInput => ({
  title: data?.title || "",
  description: data?.description,
  fn: data?.fn || "",
  ...parseMoreInformation(data),
});
