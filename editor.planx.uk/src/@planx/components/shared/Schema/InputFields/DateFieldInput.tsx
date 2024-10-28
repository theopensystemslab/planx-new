import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { paddedDate } from "@planx/components/DateInput/model";
import type { DateField } from "@planx/components/shared/Schema/model";
import React from "react";
import InputLegend from "ui/editor/InputLegend";
import DateInput from "ui/shared/DateInput/DateInput";

import { getFieldProps, Props } from ".";
import { FieldInputDescription } from "./shared";

export const DateFieldInput: React.FC<Props<DateField>> = (props) => {
  const { data, formik } = props;
  const { id, errorMessage, name, value } = getFieldProps(props);

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
      <DateInput
        value={value?.toString()}
        bordered
        onChange={(newDate: string, eventType: string) => {
          formik.setFieldValue(name, paddedDate(newDate, eventType));
        }}
        error={errorMessage}
        id={id}
      />
    </Box>
  );
};
