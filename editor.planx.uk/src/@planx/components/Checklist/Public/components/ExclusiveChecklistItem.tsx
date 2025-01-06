import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Unstable_Grid2";
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
      <Box width={36}>
        <Typography align="center">or</Typography>
      </Box>
      <ChecklistItem
        onChange={changeCheckbox(exclusiveOrOption.id)}
        label={exclusiveOrOption.data.text}
        id={exclusiveOrOption.id}
        checked={formik.values.checked.includes(exclusiveOrOption.id)}
      />
    </Grid>
  </FormWrapper>
);
