import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { AddressFields } from "@planx/components/AddressInput/Public";
import React from "react";
import InputLegend from "ui/editor/InputLegend";

import { AddressField } from "../model";
import { getFieldProps, Props } from ".";
import { FieldInputDescription } from "./shared";

export const AddressFieldInput: React.FC<Props<AddressField>> = (props) => {
  const { data, formik } = props;
  const { id, errorMessage, value } = getFieldProps(props);

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
      <AddressFields
        id={id}
        values={value}
        errors={errorMessage}
        handleChange={formik.handleChange}
      />
    </Box>
  );
};
