import { NumberInput } from "../NumberInput/model";
import { MoreInformation, Option, parseMoreInformation } from "../shared";
import { TextInput } from "../TextInput/model";
import { SCHEMAS } from "./Editor";

/**
 * Simplified custom QuestionInput as existing model is too complex for our needs currently
 * If adding more properties here, check if re-using existing model could be an option
 */
interface QuestionInput {
  title: string;
  description?: string;
  fn?: string;
  options: Option[];
}

export type TextField = { type: "text"; required?: boolean; data: TextInput };
export type NumberField = {
  type: "number";
  required?: boolean;
  data: NumberInput;
};
export type QuestionField = {
  type: "question";
  required?: boolean;
  data: QuestionInput;
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
  min?: number;
  max?: number;
}

export interface List extends MoreInformation {
  fn: string;
  title: string;
  description?: string;
  schemaName: string;
  schema: Schema;
}

export const parseContent = (data: Record<string, any> | undefined): List => ({
  fn: data?.fn || "",
  title: data?.title,
  description: data?.description,
  schemaName: data?.schemaName || SCHEMAS[0].name,
  schema: data?.schema || SCHEMAS[0].schema,
  ...parseMoreInformation(data),
});
