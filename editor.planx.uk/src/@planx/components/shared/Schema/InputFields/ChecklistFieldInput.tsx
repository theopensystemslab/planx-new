import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import type { ChecklistField } from "@planx/components/shared/Schema/model";
import React from "react";
import InputLabel from "ui/public/InputLabel";
import ChecklistItem from "ui/shared/ChecklistItem";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import { getFieldProps, Props } from ".";

export const ChecklistFieldInput: React.FC<Props<ChecklistField>> = (props) => {
  const {
    data: { title, description, options },
    formik,
  } = props;
  const { id, errorMessage, name, value } = getFieldProps(props);

  if (!Array.isArray(value))
    throw Error(
      "'value' prop for ChecklistFieldInput must be of type string[]",
    );

  const changeCheckbox =
    (id: string) =>
    async (
      _checked: React.MouseEvent<HTMLButtonElement, MouseEvent> | undefined,
    ) => {
      let newCheckedIds;

      if (value.includes(id)) {
        newCheckedIds = (value as string[]).filter((x) => x !== id);
      } else {
        newCheckedIds = [...value, id];
      }

      await formik.setFieldValue(name, newCheckedIds);
    };

  return (
    <InputLabel label={title} id={`checklist-label-${id}`}>
      {description && (
        <Typography variant="body2" mb={1.5}>
          {description}
        </Typography>
      )}
      <ErrorWrapper error={errorMessage} id={id}>
        <Grid container component="fieldset">
          <legend style={visuallyHidden}>{title}</legend>
          {options.map((option) => (
            <ChecklistItem
              key={option.id}
              onChange={changeCheckbox(option.id)}
              label={option.data.text}
              id={option.id}
              checked={value.includes(option.id)}
            />
          ))}
        </Grid>
      </ErrorWrapper>
    </InputLabel>
  );
};
