import Grid from "@mui/material/Grid";
import { visuallyHidden } from "@mui/utils";
import {
  checklistInputValidationSchema,
  FlatChecklist,
} from "@planx/components/Checklist/model";
import { Option } from "@planx/components/Option/model";
import { ChecklistLayout } from "@planx/components/shared/BaseChecklist/model";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { PublicProps } from "@planx/components/shared/types";
import { getIn, useFormik } from "formik";
import { partition } from "lodash";
import React, { useEffect } from "react";
import FullWidthWrapper from "ui/public/FullWidthWrapper";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import { object } from "yup";

import { changeCheckbox } from "../helpers";
import { useExclusiveOption } from "../hooks/useExclusiveOption";
import { useSortedOptions } from "../hooks/useSortedOptions";
import { ChecklistItems } from "./ChecklistItems";
import { ExclusiveChecklistItem } from "./ExclusiveChecklistItem";

const FlatChecklistComponent: React.FC<PublicProps<FlatChecklist>> = (
  props,
) => {
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
    autoAnswers,
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
      checked: checklistInputValidationSchema({ data: props, required: true }),
    }),
  });

  const { setCheckedFieldValue, layout } = useSortedOptions(
    options,
    groupedOptions,
    formik,
  );

  const [exclusiveOptions, nonExclusiveOptions]: Option[][] = partition(
    options,
    (option) => option.data.exclusive,
  );

  const {
    exclusiveOrOption,
    exclusiveOptionIsChecked,
    toggleExclusiveCheckbox,
  } = useExclusiveOption(exclusiveOptions, formik);

  const toggleCheckbox = (id: string) =>
    changeCheckbox({
      id,
      setCheckedFieldValue,
      currentCheckedIds: formik.values.checked,
      exclusiveOrOption,
      toggleExclusiveCheckbox,
      nonExclusiveOptions,
    });

  const hasImages = layout === ChecklistLayout.Images;

  // Auto-answered Checklists still set a breadcrumb even though they render null
  useEffect(() => {
    if (autoAnswers) {
      handleSubmit?.({
        answers: autoAnswers,
        auto: true,
      });
    }
  }, [autoAnswers, handleSubmit]);

  // Auto-answered Checklists are not publicly visible
  if (autoAnswers) {
    return null;
  }

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
          <Grid container spacing={hasImages ? 2 : 0} component="fieldset">
            <legend style={visuallyHidden}>{text}</legend>
            <ChecklistItems
              nonExclusiveOptions={nonExclusiveOptions}
              layout={layout}
              changeCheckbox={toggleCheckbox}
              formik={formik}
              exclusiveOptionIsChecked={exclusiveOptionIsChecked}
            />
            {exclusiveOrOption && (
              <ExclusiveChecklistItem
                exclusiveOrOption={exclusiveOrOption}
                changeCheckbox={toggleCheckbox}
                formik={formik}
                hasImages={hasImages}
              />
            )}
          </Grid>
        </ErrorWrapper>
      </FullWidthWrapper>
    </Card>
  );
};

export default FlatChecklistComponent;
