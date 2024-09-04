import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { paddedDate } from "@planx/components/DateInput/model";
import type { DateField } from "@planx/components/shared/Schema/model";
import React from "react";
import InputLabel from "ui/public/InputLabel";
import DateInput from "ui/shared/DateInput";

import { getFieldProps, Props } from ".";

export const DateFieldInput: React.FC<Props<DateField>> = (props) => {
  const { data, formik } = props;
  const { id, errorMessage, name, value } = getFieldProps(props);

  return (
    <InputLabel label={data.title} htmlFor={id}>
      {data.description && (
        <Typography variant="body2" mb={1.5}>
          {data.description}
        </Typography>
      )}
      <Box sx={{ display: "flex", alignItems: "baseline" }}>
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
    </InputLabel>
  );
};
