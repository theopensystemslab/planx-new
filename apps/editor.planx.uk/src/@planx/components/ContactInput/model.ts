import { richText } from "lib/yupExtensions";
import { isValidPhoneNumber } from "libphonenumber-js";
import type { SchemaOf } from "yup";
import { boolean, object, string } from "yup";

import type { BaseNodeData } from "../shared";
import { baseNodeDataValidationSchema, parseBaseNodeData } from "../shared";

export type Contact = {
  title?: string;
  firstName: string;
  lastName: string;
  organisation?: string;
  phone?: string;
  email?: string;
};

export const contactValidationSchema = (
  fieldsRequired: Pick<
    ContactInput,
    "titleRequired" | "organisationRequired" | "phoneRequired" | "emailRequired"
  >,
): SchemaOf<Contact> =>
  object({
    title: fieldsRequired.titleRequired
      ? string().trim().required("Enter a title")
      : string(),
    firstName: string()
      .trim()
      .required("Enter a first name")
      .min(2, "First name must have more than one character"),
    lastName: string()
      .trim()
      .required("Enter a last name")
      .min(2, "Last name must have more than one character"),
    organisation: fieldsRequired.organisationRequired
      ? string().required()
      : string(),
    phone: fieldsRequired.phoneRequired
      ? string()
          .trim()
          .required("Enter a phone number")
          .test("valid-phone", "Enter a valid phone number", (val) => {
            if (val == undefined) return true;
            return isValidPhoneNumber(val, "GB");
          })
      : string()
          .optional()
          .trim()
          .test("valid-phone", "Enter a valid phone number", (val) => {
            if (!val) return true;
            return isValidPhoneNumber(val, "GB");
          }),
    email: fieldsRequired.emailRequired
      ? string()
          .trim()
          .email(
            "Enter an email address in the correct format, like name@example.com",
          )
          .required("Enter an email address")
      : string()
          .trim()
          .email(
            "Enter an email address in the correct format, like name@example.com",
          ),
  }).test({
    name: "Test Test is not used for applications",
    test: ({ firstName, lastName }, context) => {
      const isValid =
        [firstName, lastName]
          .map((x) => String(x).toLowerCase().trim())
          .join("|") !== "test|test";

      if (isValid) return true;

      return context.createError({
        path: "firstName",
        message:
          "'Test Test' is not a valid name - please submit test applications via the staging environment",
      });
    },
  });

export interface ContactInput extends BaseNodeData {
  title: string;
  description?: string;
  fn?: string;
  titleRequired?: boolean;
  organisationRequired?: boolean;
  phoneRequired?: boolean;
  emailRequired?: boolean;
}

export const parseContactInput = (
  data: Record<string, any> | undefined,
): ContactInput => ({
  title: data?.title || "",
  description: data?.description,
  fn: data?.fn || "",
  titleRequired: data?.titleRequired ?? false,
  organisationRequired: data?.organisationRequired ?? false,
  phoneRequired: data?.phoneRequired ?? true,
  emailRequired: data?.emailRequired ?? true,
  ...parseBaseNodeData(data),
});

export const editorValidationSchema: SchemaOf<ContactInput> =
  baseNodeDataValidationSchema.concat(
    object({
      title: string().required(),
      description: richText(),
      fn: string().nullable().required(),
      titleRequired: boolean().required(),
      organisationRequired: boolean().required(),
      phoneRequired: boolean().required(),
      emailRequired: boolean().required(),
    }),
  );
