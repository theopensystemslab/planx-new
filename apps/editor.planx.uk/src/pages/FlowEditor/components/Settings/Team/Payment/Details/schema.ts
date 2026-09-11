import { object, type SchemaOf, string } from "yup";

import type { InvoiceDetailsFormValues } from "./types";

export const validationSchema: SchemaOf<InvoiceDetailsFormValues> =
  object().shape({
    businessName: string().required(
      "Enter an organisation name for the invoice to be addressed to",
    ),
    emailAddress: string()
      .email(
        "Enter an email address in the correct format, like example@email.com",
      )
      .required("Enter an email address for invoices to be sent to"),
    companyRegistration: string().optional(),
    vatNumber: string().required("Enter your VAT number"),
  });

export const defaultValues: InvoiceDetailsFormValues = {
  businessName: "",
  emailAddress: "",
  companyRegistration: "",
  vatNumber: "",
};
