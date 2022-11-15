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
  firstName: string().required("First name is required"),
  lastName: string().required("Last name is required"),
  organisation: string(),
  phone: string().required("Phone number is required"),
  email: string().email("Enter a valid email").required("Email is required"),
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
