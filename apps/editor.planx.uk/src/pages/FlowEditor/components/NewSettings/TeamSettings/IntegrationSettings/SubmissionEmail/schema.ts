import { object, string } from "yup";

export const validationSchema = object().shape({
  submissionEmail: string().email("Enter a valid email address").default(""),
});
