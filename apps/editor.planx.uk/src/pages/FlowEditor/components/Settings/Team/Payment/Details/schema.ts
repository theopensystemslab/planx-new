import { object, type SchemaOf, string } from "yup";

import type { InvoiceDetailsFormValues } from "./types";

export const validationSchema: SchemaOf<InvoiceDetailsFormValues> =
  object().shape({
    organisationName: string().required(
      "Enter an organisation name for the invoice to be addressed to",
    ),
    emailAddress: string()
      .email(
        "Enter an email address in the correct format, like example@email.com",
      )
      .required("Enter an email address for invoices to be sent to"),
    companyRegistration: string().optional(),
    vatNumber: string().required("Enter your VAT number"),
    referenceCode: string().optional(),
  });

/**
 * A named Stripe account is a separate seller, so needs its own reference code for its invoice numbers
 */
export const namedAccountValidationSchema: SchemaOf<InvoiceDetailsFormValues> =
  validationSchema.shape({
    referenceCode: string()
      .required("Enter a reference code")
      .matches(
        /^[A-Z]{3,5}$/,
        "Reference code must be between 3 and 5 letters long",
      ),
  });

export const defaultValues: InvoiceDetailsFormValues = {
  organisationName: "",
  emailAddress: "",
  companyRegistration: "",
  vatNumber: "",
  referenceCode: "",
};
