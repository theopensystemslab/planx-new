import { object, type SchemaOf, string } from "yup";

import type { InvoiceAddressFormValues } from "./types";

export const validationSchema: SchemaOf<InvoiceAddressFormValues> =
  object().shape({
    addressLine1: string().required(
      "Enter the first line of an address for the invoice to be addressed to",
    ),
    addressLine2: string().optional(),
    townCity: string().required("Enter the town or city of the address"),
    county: string().optional(),
    postcode: string().required("Enter your postcode"),
  });

export const defaultValues: InvoiceAddressFormValues = {
  addressLine1: "",
  addressLine2: "",
  townCity: "",
  county: "",
  postcode: "",
};
