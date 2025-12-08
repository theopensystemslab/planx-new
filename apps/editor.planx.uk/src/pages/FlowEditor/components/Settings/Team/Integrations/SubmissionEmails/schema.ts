import { array, boolean, number, object, string } from "yup";

import { SubmissionEmailFormValues } from "./types";

export const validationSchema = object().shape({
  submissionIntegrations: array(
    object().shape({
      submissionEmail: string()
        .email("Enter a valid email address")
        .required("Submission email is required"),
      defaultEmail: boolean().required(),
      teamId: number().required(),
    }),
  ).required("At least one change must be made."),
});

export const defaultValues: SubmissionEmailFormValues = {
  submissionIntegrations: [],
};
