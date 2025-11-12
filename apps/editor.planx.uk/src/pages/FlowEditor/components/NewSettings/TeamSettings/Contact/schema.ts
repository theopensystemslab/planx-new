import { object, string } from "yup";

export const validationSchema = object().shape({
  helpEmail: string()
    .email(
      "Enter an email address in the correct format, like example@email.com",
    )
    .required("Enter a contact email address")
    .default(""),
  helpPhone: string().required("Enter a phone number").default(""),
  helpOpeningHours: string().required("Enter your opening hours").default(""),
  homepage: string()
    .url(
      "Enter a homepage URL in the correct format, like https://www.localauthority.gov.uk/",
    )
    .required("Enter a homepage")
    .default(""),
});
