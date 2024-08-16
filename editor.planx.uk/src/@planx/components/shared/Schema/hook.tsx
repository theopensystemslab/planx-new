import { useFormik } from "formik";

import { generateInitialValues, generateValidationSchema, Schema, UserData, UserResponse } from "./model";

interface Props {
  schema: Schema;
  onSubmit: (values: UserData) => void;
  previousValues?: UserResponse[];
}

export const useSchema = ({
  schema,
  onSubmit,
  previousValues,
}: Props) => {
  const validationSchema = generateValidationSchema(schema);
  const initialValues = generateInitialValues(schema);

  const getInitialValues = () => {
    if (previousValues) return previousValues;

    return schema.min ? [initialValues] : [];
  };

  const formik = useFormik<UserData>({
    initialValues: {
      userData: getInitialValues(),
    },
    onSubmit,
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema,
  });

  return { formik, initialValues, };
}