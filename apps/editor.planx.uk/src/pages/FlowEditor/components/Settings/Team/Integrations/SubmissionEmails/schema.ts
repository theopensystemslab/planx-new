import { array,boolean, object, string } from "yup";

import { SubmissionEmailFormValues } from "./types";

export const validationSchema = object().shape({
  input: object().shape({
    submissionEmail: string()
      .email("Enter a valid email address")
      .required("Submission email is required"),
    defaultEmail: boolean().required(),
  }),
  saved: object().shape({
    existingEmails: array(
      object().shape({
        submissionEmail: string()
          .email("Enter a valid email address")
          .required("Submission email is required"),
        defaultEmail: boolean().required(),
      }),
    ).required(),
  }),
});

export const defaultValues: SubmissionEmailFormValues = {
  input: {
    submissionEmail: "",
    defaultEmail: false,
  },
  saved: {
    existingEmails: [],
  },
};
