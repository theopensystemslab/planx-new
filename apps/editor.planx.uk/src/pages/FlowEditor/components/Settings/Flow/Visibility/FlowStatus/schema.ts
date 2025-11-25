import { mixed, object } from "yup";

export const validationSchema = object({
  status: mixed().oneOf(["online", "offline"]),
});
