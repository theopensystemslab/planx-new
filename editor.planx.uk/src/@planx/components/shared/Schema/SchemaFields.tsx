import { FormikProps } from "formik";
import { get } from "lodash";
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

  const fieldProps = {
    id: `input-${props.type}-${props.data.fn}`,
    errorMessage: get(props.formik.errors, ["userData", props.activeIndex, props.data.fn]),
    onChange: props.formik.handleChange,
    value: props.formik.values.userData[props.activeIndex][props.data.fn],
    name: `userData[${props.activeIndex}]['${props.data.fn}']`,
  };

  switch (props.type) {
    case "text":
      return <TextFieldInput {...fieldProps} {...props} />;
    case "number":
      return <NumberFieldInput {...fieldProps} {...props} />;
    case "question":
      if (props.data.options.length === 2) {
        return <RadioFieldInput {...fieldProps} {...props} />;
      }
      return <SelectFieldInput {...fieldProps} {...props} />;
    case "checklist":
      return (
        <ChecklistFieldInput
          {...fieldProps}
          {...props}
          value={fieldProps.value as string[]}
          onChange={props.formik.setFieldValue}
        />
      );
    case "date":
      return (
        <DateFieldInput
          {...fieldProps}
          {...props}
          value={fieldProps.value as string}
          onChange={props.formik.setFieldValue}
        />
      );
    case "map":
      return (
        <MapFieldInput
          {...fieldProps}
          {...props}
          value={fieldProps.value as any[]}
          onChange={props.formik.setFieldValue}
        />
      )
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