import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { FormikProps } from "formik";
import React from "react";
import FormWrapper from "ui/public/FormWrapper";
import ChecklistItem from "ui/shared/ChecklistItem/ChecklistItem";

import { Option } from "../../../shared";

export const ExclusiveChecklistItem = ({
  exclusiveOrOption,
  changeCheckbox,
  formik,
}: {
  exclusiveOrOption: Option;
  changeCheckbox: (id: string) => () => void;
  formik: FormikProps<{ checked: Array<string> }>;
}) => (
  <FormWrapper key={exclusiveOrOption.id}>
    <Grid item xs={12} key={exclusiveOrOption.data.text}>
      <Typography width={36} display="flex" justifyContent="center">
        or
      </Typography>

      <ChecklistItem
        onChange={changeCheckbox(exclusiveOrOption.id)}
        label={exclusiveOrOption.data.text}
        id={exclusiveOrOption.id}
        checked={formik.values.checked.includes(exclusiveOrOption.id)}
      />
    </Grid>
  </FormWrapper>
);
