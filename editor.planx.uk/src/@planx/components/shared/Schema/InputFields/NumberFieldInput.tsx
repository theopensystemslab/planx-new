import Box from "@mui/material/Box";
import type { NumberField } from "@planx/components/shared/Schema/model";
import React from "react";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input";
import InputRowLabel from "ui/shared/InputRowLabel";

import { DESCRIPTION_TEXT, ERROR_MESSAGE } from "../../constants";
import { getFieldProps, Props } from ".";

export const NumberFieldInput: React.FC<Props<NumberField>> = (props) => {
  const fieldProps = getFieldProps(props);
  const { data, formik } = props;
  const { id, errorMessage } = fieldProps;

  return (
    <InputLabel label={data.title} htmlFor={id}>
      <Box sx={{ display: "flex", alignItems: "baseline" }}>
        <Input
          {...fieldProps}
          onChange={formik.handleChange}
          required
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
