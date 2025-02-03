import { Address } from "@opensystemslab/planx-core/types";
import {
  AddressInput,
  addressValidationSchema,
} from "@planx/components/AddressInput/model";
import { Feature } from "geojson";
import { exhaustiveCheck } from "utils";
import { array, BaseSchema, object, ObjectSchema, string } from "yup";

import { checklistInputValidationSchema } from "../../Checklist/model";
import { DateInput, dateInputValidationSchema } from "../../DateInput/model";
import {
  NumberInput,
  numberInputValidationSchema,
} from "../../NumberInput/model";
import { TextInput, textInputValidationSchema } from "../../TextInput/model";
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

export const questionInputValidationSchema = ({
  data,
  required,
}: FieldValidationSchema<QuestionInput>) =>
  string()
    .when([], {
      is: () => required,
      then: string().required("Select your answer before continuing"),
      otherwise: string().notRequired(),
    })
    .test("isValidOption", "Invalid selection", (value) => {
      if (!value) return true;

      // Check validity regardless of "required" status
      return data.options.some(
        (option) => value === (option.data.val || option.data.text),
      );
    });

/**
 * Describes the input of function which returns a Yup validation schema for a field
 */
export interface FieldValidationSchema<T extends Omit<Field["data"], "fn">> {
  data: T;
  required: boolean;
}

export const mapInputValidationSchema = ({
  data: { mapOptions },
  required,
}: FieldValidationSchema<MapInput>) =>
  array()
    .when([], {
      is: () => required,
      then: array().min(
        1,
        `Draw at least one ${
          mapOptions?.drawType?.toLocaleLowerCase() || "feature"
        } on the map`,
      ),
      otherwise: array().notRequired(),
    })
    .test({
      name: "validGeoJSON",
      message: "Input must be valid GeoJSON",
      test: (features?: Array<Feature>) => {
        if (!features?.length) return true;

        const isGeoJSON = (input: Feature) => input?.type === "Feature";

        return features.every(isGeoJSON);
      },
    });

type BaseField<T> = {
  required?: boolean;
  data: T & { fn: string };
};

export interface TextField extends BaseField<TextInput> {
  type: "text";
}

export interface NumberField extends BaseField<NumberInput> {
  type: "number";
}

export interface QuestionField extends BaseField<QuestionInput> {
  type: "question";
}

export interface ChecklistField extends BaseField<ChecklistInput> {
  type: "checklist";
}

export interface DateField extends BaseField<DateInput> {
  type: "date";
}

export interface AddressField extends BaseField<AddressInput> {
  type: "address";
}

type MapInput = {
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

export interface MapField extends BaseField<MapInput> {
  type: "map";
}

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
  | AddressField
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
  : T extends AddressField
  ? Address
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

// Type-guards to narrow the type of response values
// Required as we often need to match a value with it's corresponding schema field
export const isNumberFieldResponse = (
  response: unknown,
): response is ResponseValue<NumberField> => typeof response === "number";

export const isTextResponse = (
  response: unknown,
): response is ResponseValue<TextField | DateField | QuestionField> =>
  typeof response === "string";

export const isMapFieldResponse = (
  response: unknown,
): response is ResponseValue<MapField> =>
  Array.isArray(response) && response[0]?.type === "Feature";

export const isChecklistFieldResponse = (
  response: unknown,
): response is ResponseValue<ChecklistField> =>
  Array.isArray(response) && !isMapFieldResponse(response);

export const isAddressFieldResponse = (
  response: unknown,
): response is ResponseValue<AddressField> =>
  typeof response === "object" && response !== null && "line1" in response;

/**
 * For each field in schema, return a map of Yup validation schema
 * Matches both the field type and data
 */
const generateValidationSchemaForFields = (
  fields: Field[],
): ObjectSchema<Record<Field["data"]["fn"], BaseSchema>> => {
  const fieldSchemas: { [key: string]: BaseSchema } = {};

  fields.forEach(({ data, type, required = true }) => {
    switch (type) {
      case "text":
        fieldSchemas[data.fn] = textInputValidationSchema({
          data,
          required,
        });
        break;
      case "number":
        fieldSchemas[data.fn] = numberInputValidationSchema({
          data,
          required,
        });
        break;
      case "question":
        fieldSchemas[data.fn] = questionInputValidationSchema({
          data,
          required,
        });
        break;
      case "checklist":
        fieldSchemas[data.fn] = checklistInputValidationSchema({
          data,
          required,
        });
        break;
      case "date":
        fieldSchemas[data.fn] = dateInputValidationSchema({ data, required });
        break;
      case "address":
        fieldSchemas[data.fn] = addressValidationSchema();
        break;
      case "map":
        fieldSchemas[data.fn] = mapInputValidationSchema({ data, required });
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
      case "address":
        initialValues[field.data.fn] = {
          line1: "",
          line2: "",
          town: "",
          county: "",
          postcode: "",
          country: "",
        };
        break;
      default:
        initialValues[field.data.fn] = "";
        break;
    }
  });
  return initialValues;
};
