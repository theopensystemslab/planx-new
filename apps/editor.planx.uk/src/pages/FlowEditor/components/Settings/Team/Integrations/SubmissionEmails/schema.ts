import { array, boolean, number, object, string } from "yup";

export const validationSchema = object().shape({
  submissionIntegrations: array(
    object().shape({
      submissionEmail: string()
        .email("Enter a valid email address")
        .required("Submission email is required"),
      defaultEmail: boolean().required(),
      teamId: number().required(),
      id: string().notRequired(),
    }),
  ),
});
