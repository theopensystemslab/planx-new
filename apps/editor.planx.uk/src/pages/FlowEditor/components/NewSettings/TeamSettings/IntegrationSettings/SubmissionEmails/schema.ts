import { boolean, number,object, string } from "yup";

import { SubmissionEmailFormValues } from "./types";

export const validationSchema = object().shape({
  teamId: number().required(),
  submissionEmail: string()
    .email("Enter a valid email address")
    .required("Submission email is required"),
  defaultEmail: boolean().required(),
});

export const defaultValues: SubmissionEmailFormValues = {
  submissionEmail: "",
  defaultEmail: false,
};
