import Grid from "@mui/material/Grid";
import { visuallyHidden } from "@mui/utils";
import { checklistValidationSchema } from "@planx/components/Checklist/model";
import { Option } from "@planx/components/shared";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { getIn, useFormik } from "formik";
import { partition } from "lodash";
import React from "react";
import FullWidthWrapper from "ui/public/FullWidthWrapper";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import { object } from "yup";

import { PublicChecklistProps } from "../../../types";
import { toggleNonExclusiveCheckbox } from "../../helpers";
import { useExclusiveOption } from "../../hooks/useExclusiveOption";
import { useSortedOptions } from "../../hooks/useSortedOptions";
import { ExclusiveChecklistItem } from "../ExclusiveChecklistItem";
import { ChecklistLayout } from "../VisibleChecklist";
import { ChecklistItems } from "./ChecklistItems";

export const Checklist: React.FC<PublicChecklistProps> = (props) => {
  const {
    description = "",
    groupedOptions,
    handleSubmit,
    howMeasured,
    info,
    options,
    policyRef,
    text,
    img,
    previouslySubmittedData,
    id,
  } = props;

  const formik = useFormik<{ checked: Array<string> }>({
    initialValues: {
      checked: previouslySubmittedData?.answers || [],
    },
    onSubmit: (values) => {
      handleSubmit?.({ answers: values.checked });
    },
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: object({
      checked: checklistValidationSchema(props),
    }),
  });

  const { setCheckedFieldValue, layout } = useSortedOptions(
    options,
    groupedOptions,
    formik
  );

  const [exclusiveOptions, nonExclusiveOptions]: Option[][] = partition(
    options,
    (option) => option.data.exclusive
  );

  const {
    exclusiveOrOption,
    exclusiveOptionIsChecked,
    toggleExclusiveCheckbox,
  } = useExclusiveOption(exclusiveOptions, formik);

  const changeCheckbox = (id: string) => () => {
    const currentCheckedIds = formik.values.checked;

    const currentCheckboxIsExclusiveOption =
      exclusiveOrOption && id === exclusiveOrOption.id;

    if (currentCheckboxIsExclusiveOption) {
      const newCheckedIds = toggleExclusiveCheckbox(id);
      setCheckedFieldValue(newCheckedIds);
      return;
    }
    const newCheckedIds = toggleNonExclusiveCheckbox(
      id,
      currentCheckedIds,
      exclusiveOrOption
    );
    setCheckedFieldValue(newCheckedIds);
  };

  return (
    <Card handleSubmit={formik.handleSubmit} isValid>
      <CardHeader
        title={text}
        description={description}
        info={info}
        policyRef={policyRef}
        howMeasured={howMeasured}
        img={img}
      />
      <FullWidthWrapper>
        <ErrorWrapper error={getIn(formik.errors, "checked")} id={id}>
          <Grid
            container
            spacing={layout === ChecklistLayout.Images ? 2 : 0}
            component="fieldset"
          >
            <legend style={visuallyHidden}>{text}</legend>
            <ChecklistItems
              nonExclusiveOptions={nonExclusiveOptions}
              layout={layout}
              changeCheckbox={changeCheckbox}
              formik={formik}
              exclusiveOptionIsChecked={exclusiveOptionIsChecked}
            />
            {exclusiveOrOption && (
              <ExclusiveChecklistItem
                exclusiveOrOption={exclusiveOrOption}
                changeCheckbox={changeCheckbox}
                formik={formik}
              />
            )}
          </Grid>
        </ErrorWrapper>
      </FullWidthWrapper>
    </Card>
  );
};
