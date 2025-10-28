import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  AddressFields,
  AddressFieldsProps,
} from "@planx/components/AddressInput/Public";
import React from "react";
import InputLegend from "ui/editor/InputLegend";

import { AddressField } from "../model";
import { getFieldProps, Props } from ".";
import { FieldInputDescription } from "./shared";

export const AddressFieldInput: React.FC<Props<AddressField>> = (props) => {
  const { data, formik } = props;
  const { id, errorMessage, value, name } = getFieldProps(props);

  /**
   * Maps changes from AddressField inputs to their corresponding nested form fields
   * @example
   * The input for name=line1 will be mapped to the schemaData[0][yourFn]["line1"] formik field
   */
  const handleChange: AddressFieldsProps["handleChange"] = (e) => {
    const field = `${name}.${e.target.name}`;
    formik.setFieldValue(field, e.target.value);
  };

  return (
    <Box component="fieldset">
      <InputLegend>
        <Typography variant="body1" pb={1}>
          <strong>{data.title}</strong>
        </Typography>
      </InputLegend>
      {data.description && (
        <FieldInputDescription description={data.description} />
      )}
      <Box sx={{ gap: 2, display: "flex", flexDirection: "column" }}>
        <AddressFields
          id={id}
          values={value}
          errors={errorMessage}
          handleChange={handleChange}
        />
      </Box>
    </Box>
  );
};
