import Box from "@mui/material/Box";
import type { NumberField } from "@planx/components/shared/Schema/model";
import React from "react";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input/Input";
import InputRowLabel from "ui/shared/InputRowLabel";

import { DESCRIPTION_TEXT, ERROR_MESSAGE } from "../../constants";
import { getFieldProps, Props } from ".";
import { FieldInputDescription } from "./shared";

export const NumberFieldInput: React.FC<Props<NumberField>> = (props) => {
  const fieldProps = getFieldProps(props);
  const { data, formik } = props;
  const { id, errorMessage, required, title } = fieldProps;

  return (
    <InputLabel label={title} htmlFor={id}>
      {data.description && (
        <FieldInputDescription description={data.description} />
      )}
      <Box sx={{ display: "flex", alignItems: "baseline" }}>
        <Input
          {...fieldProps}
          onChange={formik.handleChange}
          required={required}
          bordered
          type="number"
          inputProps={{
            "aria-describedby": [
              data.description ? DESCRIPTION_TEXT : "",
              errorMessage ? `${ERROR_MESSAGE}-${id}` : "",
            ]
              .filter(Boolean)
              .join(" "),
          }}
        />
        {data.units && <InputRowLabel>{data.units}</InputRowLabel>}
      </Box>
    </InputLabel>
  );
};
