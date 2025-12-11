import { object, string } from "yup";

import type { SubmissionEmailFormValues } from "./types";

export const validationSchema = object().shape({
  submissionEmail: string().required().email("Enter a valid email address"),
});

export const defaultValues: SubmissionEmailFormValues = {
  submissionEmail: "",
};
