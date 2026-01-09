import * as Yup from "yup";

export const upsertEmailSchema = (
  existingEmails: string[],
  currentEmail?: string,
) =>
  Yup.object().shape({
    submissionEmail: Yup.string()
      .email("Invalid email")
      .required("Email is required")
      .test("unique-email", "Please enter a unique email address", (value) => {
        if (value === currentEmail) return true;
        return !existingEmails.includes(value || "");
      }),
    defaultEmail: Yup.boolean(),
  });
