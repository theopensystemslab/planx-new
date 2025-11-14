import { object, string } from "yup";

export const validationSchema = object().shape({
  referenceCode: string()
    .min(3, "Code must be at least 3 characters long")
    .max(5, "Code cannot exceed 5 characters long")
    .required("Enter a reference code")
    .default(""),
});
