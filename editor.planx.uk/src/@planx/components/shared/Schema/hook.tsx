import { FormikConfig } from "formik";

import {
  generateInitialValues,
  generateValidationSchema,
  Schema,
  SchemaUserData,
  SchemaUserResponse,
} from "./model";

type UseSchema = (props: {
  schema: Schema;
  previousValues?: SchemaUserResponse[];
}) => {
  /**
   * Extensible Formik config which allows custom form state and submission logic
   * @example const formik = useFormik<SchemaUserData | MyCustomState>(...)
   * @example const formik = useFormik<SchemaUserData>(...formikConfig, onSubmit: () => {...})
   */
  formikConfig: Omit<FormikConfig<SchemaUserData>, "onSubmit">;
  /**
   * A blank set of initial values matching the schema
   * Can be if multiple responses are allowed (e.g. in the List component)
   */
  initialValues: SchemaUserResponse;
};

/**
 * Hook which allows you to embed a group of fields, described by a schema, within another component
 * Form state and custom logic is stored and managed within the parent component
 */
export const useSchema: UseSchema = ({ schema, previousValues }) => {
  const validationSchema = generateValidationSchema(schema);
  const initialValues = generateInitialValues(schema);

  const getInitialValues = () => {
    if (previousValues) return previousValues;

    return schema.min ? [initialValues] : [];
  };

  const formikConfig = {
    initialValues: {
      schemaData: getInitialValues(),
    },
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema,
  };

  return { formikConfig, initialValues };
};
