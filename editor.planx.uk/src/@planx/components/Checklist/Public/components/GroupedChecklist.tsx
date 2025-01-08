import Grid from "@mui/material/Grid";
import { visuallyHidden } from "@mui/utils";
import {
  ChecklistLayout,
  checklistValidationSchema,
} from "@planx/components/Checklist/model";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { getIn, useFormik } from "formik";
import React, { useEffect } from "react";
import FullWidthWrapper from "ui/public/FullWidthWrapper";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import { object } from "yup";

import { PublicChecklistProps } from "../../types";
import {
  partitionGroupedOptionsAgain,
  toggleNonExclusiveCheckbox,
} from "../helpers";
import { useExclusiveOptionInGroupedChecklist } from "../hooks/useExclusiveOption";
import { useSortedOptions } from "../hooks/useSortedOptions";
import { ExclusiveChecklistItem } from "./ExclusiveChecklistItem";
import { GroupedChecklistOptions } from "./GroupedChecklistOptions";

export const GroupedChecklist: React.FC<PublicChecklistProps> = (props) => {
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
      checked: checklistValidationSchema(props),
    }),
  });

  const { setCheckedFieldValue, layout } = useSortedOptions(
    options,
    groupedOptions,
    formik,
  );

  const [exclusiveOptionGroups, nonExclusiveOptionGroups] =
    partitionGroupedOptionsAgain(groupedOptions!);

  const { exclusiveOrOptionGroup, toggleExclusiveCheckbox } =
    useExclusiveOptionInGroupedChecklist(exclusiveOptionGroups, formik);

  const changeCheckbox = (id: string) => () => {
    const currentCheckedIds = formik.values.checked;

    const currentCheckboxIsExclusiveOption =
      exclusiveOrOptionGroup && id === exclusiveOrOptionGroup.children[0].id;

    if (currentCheckboxIsExclusiveOption) {
      const newCheckedIds = toggleExclusiveCheckbox(id);
      setCheckedFieldValue(newCheckedIds);
      return;
    }
    const newCheckedIds = toggleNonExclusiveCheckbox(
      id,
      currentCheckedIds,
      exclusiveOrOptionGroup?.children[0],
    );
    setCheckedFieldValue(newCheckedIds);
  };

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
          <Grid
            container
            spacing={layout === ChecklistLayout.Images ? 2 : 0}
            component="fieldset"
          >
            <legend style={visuallyHidden}>{text}</legend>
            {nonExclusiveOptionGroups && (
              <GroupedChecklistOptions
                groupedOptions={nonExclusiveOptionGroups}
                previouslySubmittedData={previouslySubmittedData}
                changeCheckbox={changeCheckbox}
                formik={formik}
              />
            )}
            {exclusiveOrOptionGroup && (
              <ExclusiveChecklistItem
                exclusiveOrOption={exclusiveOrOptionGroup?.children[0]}
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
