import { object, string } from "yup";

export const validationSchema = object({
  favicon: string().defined().nullable(),
});
