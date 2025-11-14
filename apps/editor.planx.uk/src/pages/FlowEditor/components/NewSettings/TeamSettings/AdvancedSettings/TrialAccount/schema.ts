import { boolean, object } from "yup";

export const validationSchema = object().shape({
  isTrial: boolean().required().default(false),
});
