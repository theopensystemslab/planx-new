import { Feature } from "geojson";
import { exhaustiveCheck } from "utils";
import { array, BaseSchema, object, ObjectSchema, string } from "yup";

import { checklistValidationSchema } from "../../Checklist/model";
import {
  DateInput,
  dateRangeSchema as dateValidationSchema,
} from "../../DateInput/model";
import {
  NumberInput,
  numberInputValidationSchema,
} from "../../NumberInput/model";
import {
  TextInput,
  userDataSchema as textInputValidationSchema,
} from "../../TextInput/model";
import { Option } from "..";

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

interface ChecklistInput {
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

const mapValidationSchema = ({ mapOptions }: MapField["data"]) =>
  array()
    .required()
    .test({
      name: "atLeastOneFeature",
      message: `Draw at least one ${
        mapOptions?.drawType?.toLocaleLowerCase() || "feature"
      } on the map`,
      test: (features?: Array<Feature>) => {
        return Boolean(features && features?.length > 0);
      },
    });

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

export type ChecklistField = {
  type: "checklist";
  required?: true;
  data: ChecklistInput & { fn: string };
};

export type DateField = {
  type: "date";
  data: DateInput & { fn: string };
};

export type MapField = {
  type: "map";
  data: {
    title: string;
    description?: string;
    fn: string;
    mapOptions?: {
      basemap?: "OSVectorTile" | "OSRaster" | "MapboxSatellite" | "OSM";
      drawType?: "Point" | "Polygon";
      drawColor?: string;
      drawMany?: boolean;
    };
  };
};

/**
 * Represents the input types available in the List component
 * Existing models are used to allow to us to re-use existing components, maintaining consistend UX/UI
 */
export type Field =
  | TextField
  | NumberField
  | QuestionField
  | ChecklistField
  | DateField
  | MapField;

/**
 * Models the form displayed to the user
 */
export interface Schema {
  type: string;
  fields: Field[];
  min: number;
  max?: number;
}

/**
 * Value returned per field, based on field type
 */
export type ResponseValue<T extends Field> = T extends MapField
  ? Feature[]
  : T extends ChecklistField
  ? string[]
  : T extends NumberField
  ? number
  : string;

export type SchemaUserResponse = Record<
  Field["data"]["fn"],
  ResponseValue<Field>
>;

/**
 * Output data from a form using the useSchema hook
 */
export type SchemaUserData = {
  schemaData: SchemaUserResponse[];
};

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
      case "checklist":
        fieldSchemas[data.fn] = checklistValidationSchema(data);
        break;
      case "date":
        fieldSchemas[data.fn] = dateValidationSchema(data);
        break;
      case "map":
        fieldSchemas[data.fn] = mapValidationSchema(data);
        break;
      default:
        return exhaustiveCheck(type);
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
    schemaData: array().of(fieldvalidationSchema),
  });

  return validationSchema;
};

export const generateInitialValues = (schema: Schema): SchemaUserResponse => {
  const initialValues: SchemaUserResponse = {};
  schema.fields.forEach((field) => {
    switch (field.type) {
      case "checklist":
      case "map":
        initialValues[field.data.fn] = [];
        break;
      default:
        initialValues[field.data.fn] = "";
        break;
    }
  });
  return initialValues;
};
