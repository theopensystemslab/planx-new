import { array, boolean, number, object, string } from "yup";

export const validationSchema = object().shape({
  submissionEmails: array(
    object().shape({
      address: string()
        .email("Enter a valid email address")
        .required("Submission email is required"),
      isDefault: boolean().required(),
      teamId: number().required(),
      id: string().notRequired(),
    }),
  ),
});
