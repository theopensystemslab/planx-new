import { FormikProps } from "formik";
import React from "react";
import InputRow from "ui/shared/InputRow";

import { ChecklistFieldInput, DateFieldInput, MapFieldInput, NumberFieldInput, RadioFieldInput, SelectFieldInput, TextFieldInput } from "./Fields";
import { Field, Schema, UserData } from "./model";

type InputFieldProps = {
  activeIndex: number;
  formik: FormikProps<UserData>;
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
  activeIndex?: number;
  formik: FormikProps<UserData>;
  schema: Schema;
}

export const SchemaFields: React.FC<SchemaFieldsProps> = ({ schema, formik, activeIndex = 0 }) => (
  schema.fields.map((field, i) => (
    <InputRow key={i}>
      <InputField {...field} activeIndex={activeIndex} formik={formik} />
    </InputRow>
  ))
)