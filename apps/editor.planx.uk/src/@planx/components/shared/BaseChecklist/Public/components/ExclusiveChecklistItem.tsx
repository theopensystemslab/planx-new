import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { Option } from "@planx/components/Option/model";
import { FormikProps } from "formik";
import React from "react";
import FormWrapper from "ui/public/FormWrapper";
import ChecklistItem from "ui/shared/ChecklistItem/ChecklistItem";

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
      <p id="exclusive-option-explanation" style={visuallyHidden}>
        Selecting this option will deselect all other options.
      </p>
      <ChecklistItem
        onChange={changeCheckbox(exclusiveOrOption.id)}
        label={exclusiveOrOption.data.text}
        id={exclusiveOrOption.id}
        checked={formik.values.checked.includes(exclusiveOrOption.id)}
        inputProps={{ "aria-describedby": "exclusive-option-explanation" }}
      />
    </Grid>
  </FormWrapper>
);
