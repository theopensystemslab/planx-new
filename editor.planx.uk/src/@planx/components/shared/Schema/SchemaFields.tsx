import { FormikProps } from "formik";
import React from "react";
import InputRow from "ui/shared/InputRow";

import { ChecklistFieldInput, DateFieldInput, MapFieldInput, NumberFieldInput, RadioFieldInput, SelectFieldInput, TextFieldInput } from "./Fields";
import { Field, Schema, SchemaData } from "./model";

type InputFieldProps = {
  activeIndex: number;
  formik: FormikProps<SchemaData>;
} & Field;

/**
* Controller to return correct user input for field in schema
*/
const InputField: React.FC<InputFieldProps> = (props) => {
  switch (props.type) {
    case "text":
      return <TextFieldInput {...props} />;
    case "number":
      return <NumberFieldInput {...props} />;
    case "question":
      if (props.data.options.length === 2) {
        return <RadioFieldInput {...props} />;
      }
      return <SelectFieldInput {...props} />;
    case "checklist":
      return <ChecklistFieldInput {...props} />;
    case "date":
      return <DateFieldInput {...props} />;
    case "map":
      return <MapFieldInput {...props} />;
    default:
      return null;
  }
};

interface SchemaFieldsProps { 
  /** 
   * Optional index of currently active schema instance. 
   * Only required if multiple user responses are allowed, e.g. in the List component. 
   * Defaults to 0 as `SchemaData` always holds an array of responses
  */
  activeIndex?: number;
  /** Formik instance generated from config provided by useSchema hook */
  formik: FormikProps<SchemaData>;
  schema: Schema;
}

/**
 * Display a set of fields for the provided schema
 */
export const SchemaFields: React.FC<SchemaFieldsProps> = ({ schema, formik, activeIndex = 0 }) => (
  schema.fields.map((field, i) => (
    <InputRow key={i}>
      <InputField {...field} activeIndex={activeIndex} formik={formik} />
    </InputRow>
  ))
)