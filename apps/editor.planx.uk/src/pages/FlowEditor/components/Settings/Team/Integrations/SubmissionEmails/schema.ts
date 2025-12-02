import { array, boolean, object, string } from "yup";

import { SubmissionEmailFormValues } from "./types";

export const validationSchema = object().shape({
  input: array(
    object().shape({
      submissionEmail: string()
        .email("Enter a valid email address")
        .required("Submission email is required"),
      defaultEmail: boolean().required(),
    }),
  ).required("At least one new email must be added."),
  saved: array(
    object().shape({
      submissionEmail: string().email().required(),
      defaultEmail: boolean().required(),
    }),
  ).optional(),
});

export const defaultValues: SubmissionEmailFormValues = {
  input: [],
  saved: [],
};
