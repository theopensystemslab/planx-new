import { FormikConfig } from "formik";

import { generateInitialValues, generateValidationSchema, Schema, UserData, UserResponse } from "./model";

interface Props {
  schema: Schema;
  previousValues?: UserResponse[];
}

export const useSchema = ({
  schema,
  previousValues,
}: Props) => {
  const validationSchema = generateValidationSchema(schema);
  const initialValues = generateInitialValues(schema);

  const getInitialValues = () => {
    if (previousValues) return previousValues;

    return schema.min ? [initialValues] : [];
  };

  const formikConfig: Omit<FormikConfig<UserData>, "onSubmit"> = {
    initialValues: {
      userData: getInitialValues(),
    },
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema,
  }

  return { formikConfig, initialValues, };
}