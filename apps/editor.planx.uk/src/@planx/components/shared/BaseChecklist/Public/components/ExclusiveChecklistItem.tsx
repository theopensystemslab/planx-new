import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { Option } from "@planx/components/Option/model";
import { ChecklistLayout } from "@planx/components/shared/BaseChecklist/model";
import ImageButton from "@planx/components/shared/Buttons/ImageButton";
import { FormikProps } from "formik";
import React from "react";
import FormWrapper from "ui/public/FormWrapper";
import ChecklistItem from "ui/shared/ChecklistItem/ChecklistItem";

export const ExclusiveChecklistItem = ({
  exclusiveOrOption,
  changeCheckbox,
  formik,
  layout,
}: {
  exclusiveOrOption: Option;
  changeCheckbox: (id: string) => () => void;
  formik: FormikProps<{ checked: Array<string> }>;
  layout: ChecklistLayout;
}) => {
  const hasImages =
    layout === ChecklistLayout.Images ||
    layout === ChecklistLayout.GroupedImages;

  return (
    <>
      <Grid item xs={12}>
        <Box width={40}>
          <Typography align="center">or</Typography>
        </Box>
      </Grid>
      <p id="exclusive-option-explanation" style={visuallyHidden}>
        Selecting this option will deselect all other options.
      </p>
      {hasImages ? (
        <Grid item xs={12} sm={6} md={4}>
          <ImageButton
            title={exclusiveOrOption.data.text}
            id={exclusiveOrOption.id}
            img={exclusiveOrOption.data.img}
            selected={formik.values.checked.includes(exclusiveOrOption.id)}
            onClick={changeCheckbox(exclusiveOrOption.id)}
            checkbox
          />
        </Grid>
      ) : (
        <FormWrapper key={exclusiveOrOption.id}>
          <Grid item xs={12} sx={{ width: "100%" }}>
            <ChecklistItem
              onChange={changeCheckbox(exclusiveOrOption.id)}
              label={exclusiveOrOption.data.text}
              id={exclusiveOrOption.id}
              checked={formik.values.checked.includes(exclusiveOrOption.id)}
              inputProps={{
                "aria-describedby": "exclusive-option-explanation",
              }}
            />
          </Grid>
        </FormWrapper>
      )}
    </>
  );
};
