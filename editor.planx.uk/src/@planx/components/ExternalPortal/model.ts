import { baseNodeDataValidationSchema } from "@planx/components/shared";
import { object, string } from "yup";

export const validationSchema = baseNodeDataValidationSchema.concat(
  object({
    flowId: string().required("Add a flow to submit"),
  }),
);
