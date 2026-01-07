import * as Yup from "yup";

import SubmissionEmail from "../SubmissionEmail";

export const upsertEmailSchema = Yup.object({
  submissionEmail: Yup.string()
    .required("Enter an email address")
    .email(
      "Enter an email address in the correct format, like example@email.com",
    ),
  defaultEmail: Yup.boolean(),
});
