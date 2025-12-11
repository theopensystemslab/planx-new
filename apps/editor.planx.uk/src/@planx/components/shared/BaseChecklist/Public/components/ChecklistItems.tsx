import Grid from "@mui/material/Grid";
import { Option } from "@planx/components/Option/model";
import { ChecklistLayout } from "@planx/components/shared/BaseChecklist/model";
import ImageButton from "@planx/components/shared/Buttons/ImageButton";
import { FormikProps } from "formik";
import React from "react";
import FormWrapper from "ui/public/FormWrapper";
import ChecklistItem from "ui/shared/ChecklistItem/ChecklistItem";

interface Props {
  nonExclusiveOptions: Option[];
  layout: ChecklistLayout;
  changeCheckbox: (id: string) => () => void;
  formik: FormikProps<{ checked: Array<string> }>;
  exclusiveOptionIsChecked: boolean;
}

export const ChecklistItems = ({
  nonExclusiveOptions,
  layout,
  changeCheckbox,
  formik,
  exclusiveOptionIsChecked,
}: Props) => (
  <>
    {nonExclusiveOptions.map((option: Option) =>
      layout === ChecklistLayout.Basic ? (
        <FormWrapper key={option.id}>
          <Grid item xs={12} key={option.data.text}>
            <ChecklistItem
              onChange={changeCheckbox(option.id)}
              label={option.data.text}
              description={option.data.description}
              id={option.id}
              checked={
                formik.values.checked.includes(option.id) &&
                !exclusiveOptionIsChecked
              }
            />
          </Grid>
        </FormWrapper>
      ) : (
        <Grid item xs={12} sm={6} contentWrap={4} key={option.data.text}>
          <ImageButton
            title={option.data.text}
            id={option.id}
            img={option.data.img}
            selected={formik.values.checked.includes(option.id)}
            onClick={changeCheckbox(option.id)}
            checkbox
          />
        </Grid>
      ),
    )}
  </>
);
