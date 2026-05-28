import { boolean, object } from "yup";

export const validationSchema = object({
  isService: boolean().required(),
});
