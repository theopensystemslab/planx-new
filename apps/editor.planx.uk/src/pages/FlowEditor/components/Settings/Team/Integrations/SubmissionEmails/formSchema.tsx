import { boolean, object, string } from "yup";

export const upsertEmailSchema = (
  existingEmails: string[],
  currentEmail?: string,
) =>
  object().shape({
    submissionEmail: string()
      .email("Please enter a valid email")
      .required("Email is required")
      .test("unique-email", "Please enter a unique email address", (value) => {
        if (value === currentEmail) return true;
        return !existingEmails.includes(value || "");
      }),
    defaultEmail: boolean(),
  });
