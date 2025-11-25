import { object, type SchemaOf, string } from "yup";

import type { ContactFormValues } from "./types";

export const validationSchema: SchemaOf<ContactFormValues> = object().shape({
  helpEmail: string()
    .email(
      "Enter an email address in the correct format, like example@email.com",
    )
    .required("Enter a contact email address"),
  helpPhone: string().required("Enter a phone number"),
  helpOpeningHours: string().required("Enter your opening hours"),
  homepage: string()
    .url(
      "Enter a homepage URL in the correct format, like https://www.localauthority.gov.uk/",
    )
    .required("Enter a homepage"),
});

export const defaultValues: ContactFormValues = {
  helpEmail: "",
  helpPhone: "",
  helpOpeningHours: "",
  homepage: "",
};
