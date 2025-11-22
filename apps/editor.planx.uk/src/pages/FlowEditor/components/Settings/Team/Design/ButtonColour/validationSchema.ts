import { object, string } from "yup";

export const validationSchema = object({
  actionColour: string().required(),
});
