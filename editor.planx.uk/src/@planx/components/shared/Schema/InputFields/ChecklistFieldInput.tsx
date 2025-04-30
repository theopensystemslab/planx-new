import Grid from "@mui/material/Grid";
import { visuallyHidden } from "@mui/utils";
import type { ChecklistField } from "@planx/components/shared/Schema/model";
import React from "react";
import InputLabel from "ui/public/InputLabel";
import ChecklistItem from "ui/shared/ChecklistItem/ChecklistItem";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import { getFieldProps, Props } from ".";
import { FieldInputDescription } from "./shared";

export const ChecklistFieldInput: React.FC<Props<ChecklistField>> = (props) => {
  const { data, formik } = props;
  const { id, errorMessage, name, value, title } = getFieldProps(props);

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
      {data.description && (
        <FieldInputDescription description={data.description} />
      )}
      <ErrorWrapper error={errorMessage} id={id}>
        <Grid container component="fieldset">
          <legend style={visuallyHidden}>{title}</legend>
          {data.options.map((option) => (
            <Grid item xs={12}>
              <ChecklistItem
                key={option.id}
                onChange={changeCheckbox(option.id)}
                label={option.data.text}
                id={option.id}
                checked={value.includes(option.id)}
              />
            </Grid>
          ))}
        </Grid>
      </ErrorWrapper>
    </InputLabel>
  );
};
