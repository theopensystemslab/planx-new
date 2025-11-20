import { object, string } from "yup";

export const validationSchema = object({
  templatedFrom: string().nullable().defined(),
});
