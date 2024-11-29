import type {
  Field,
  ResponseValue,
  SchemaUserData,
} from "@planx/components/shared/Schema/model";
import { FormikProps } from "formik";
import { get } from "lodash";
import React from "react";
import { exhaustiveCheck } from "utils";

import { AddressFieldInput } from "./AddressFieldInput";
import { ChecklistFieldInput } from "./ChecklistFieldInput";
import { DateFieldInput } from "./DateFieldInput";
import { MapFieldInput } from "./MapFieldInput";
import { NumberFieldInput } from "./NumberFieldInput";
import { RadioFieldInput } from "./RadioFieldInput";
import { SelectFieldInput } from "./SelectInputField";
import { TextFieldInput } from "./TextFieldInput";

export type Props<T extends Field> = {
  formik: FormikProps<SchemaUserData>;
  activeIndex: number;
} & T;

/**
 * Helper function to get shared props derived from `Field` and `props.formik`
 */
export const getFieldProps = <T extends Field>(props: Props<T>) => ({
  id: `input-${props.type}-${props.data.fn}`,
  errorMessage: get(props.formik.errors, [
    "schemaData",
    props.activeIndex,
    props.data.fn,
  ]),
  name: `schemaData[${props.activeIndex}]['${props.data.fn}']`,
  value: props.formik.values.schemaData[props.activeIndex][
    props.data.fn
  ] as ResponseValue<T>,
});

/**
 * Controller to return correct user input for field in schema
 */
export const InputFields: React.FC<Props<Field>> = (props) => {
  // Local variable required for TS to correctly infer the type
  const type = props.type;

  switch (type) {
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
    case "address":
      return <AddressFieldInput {...props} />;
    default:
      return exhaustiveCheck(type);
  }
};
