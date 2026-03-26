import { object, string } from "yup";

const emailField = string()
  .email(
    "Enter an email address in the correct format, like example@email.com",
  )
  .required("Enter a valid email address");

export const emailSchema = object({
  email: emailField,
});

export const upsertMemberSchema = object({
  email: emailField,
  firstName: string().required("First name is required"),
  lastName: string().required("Last name is required"),
});
