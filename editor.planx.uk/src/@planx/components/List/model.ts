import { cloneDeep } from "lodash";
import { array, BaseSchema, object, ObjectSchema, string } from "yup";

import { NumberInput, numberInputValidationSchema } from "../NumberInput/model";
import { MoreInformation, Option, parseMoreInformation } from "../shared";
import {
  TextInput,
  userDataSchema as textInputValidationSchema,
} from "../TextInput/model";
import { SCHEMAS } from "./Editor";

/**
 * Simplified custom QuestionInput
 * Existing model is too complex for our needs currently
 * If adding more properties here, check if re-using existing model could be an option
 */
interface QuestionInput {
  title: string;
  description?: string;
  options: Option[];
}

/**
 * As above, we need a simplified validation schema for QuestionsInputs
 */
const questionInputValidationSchema = (data: QuestionInput) =>
  string()
    .oneOf(data.options.map((option) => option.data.val || option.data.text))
    .required("Select your answer before continuing");

export type TextField = {
  type: "text";
  data: TextInput & { fn: string };
};

export type NumberField = {
  type: "number";
  data: NumberInput & { fn: string };
};

export type QuestionField = {
  type: "question";
  data: QuestionInput & { fn: string };
};

/**
 * Represents the input types available in the List component
 * Existing models are used to allow to us to re-use existing components, maintaining consistend UX/UI
 */
export type Field = TextField | NumberField | QuestionField;

/**
 * Models the form displayed to the user
 */
export interface Schema {
  type: string;
  fields: Field[];
  min: number;
  max?: number;
}

export type UserResponse = Record<Field["data"]["fn"], string>;

export type UserData = { userData: UserResponse[] };

export interface List extends MoreInformation {
  fn: string;
  title: string;
  description?: string;
  schemaName: string;
  schema: Schema;
}

export const parseContent = (data: Record<string, any> | undefined): List => ({
  fn: data?.fn,
  title: data?.title,
  description: data?.description,
  schemaName: data?.schemaName || SCHEMAS[0].name,
  schema: cloneDeep(data?.schema) || SCHEMAS[0].schema,
  ...parseMoreInformation(data),
});

/**
 * For each field in schema, return a map of Yup validation schema
 * Matches both the field type and data
 */
const generateValidationSchemaForFields = (
  fields: Field[],
): ObjectSchema<Record<Field["data"]["fn"], BaseSchema>> => {
  const fieldSchemas: { [key: string]: BaseSchema } = {};

  fields.forEach(({ data, type }) => {
    switch (type) {
      case "text":
        fieldSchemas[data.fn] = textInputValidationSchema(data);
        break;
      case "number":
        fieldSchemas[data.fn] = numberInputValidationSchema(data);
        break;
      case "question":
        fieldSchemas[data.fn] = questionInputValidationSchema(data);
        break;
    }
  });

  const validationSchema = object().shape(fieldSchemas);

  return validationSchema;
};

/**
 * Generate a Yup validation schema which matches the incoming generic Schema
 */
export const generateValidationSchema = (schema: Schema) => {
  const fieldvalidationSchema = generateValidationSchemaForFields(
    schema.fields,
  );

  const validationSchema = object().shape({
    userData: array().of(fieldvalidationSchema),
  });

  return validationSchema;
};

export const generateInitialValues = (schema: Schema): UserResponse => {
  const initialValues: UserResponse = {};
  schema.fields.forEach((field) => (initialValues[field.data.fn] = ""));
  return initialValues;
};
