import { generateInitialValues, generateValidationSchema, Schema } from "./model";

export const useSchema = (schema: Schema) => {
  const validationSchema = generateValidationSchema(schema);
  const initialValues = generateInitialValues(schema);

  return { validationSchema, initialValues };
}