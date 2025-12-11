import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { visuallyHidden } from "@mui/utils";
import {
  checklistInputValidationSchema,
  type GroupedChecklist,
} from "@planx/components/Checklist/model";
import { ChecklistLayout } from "@planx/components/shared/BaseChecklist/model";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { PublicProps } from "@planx/components/shared/types";
import { getIn, useFormik } from "formik";
import React, { useEffect } from "react";
import FullWidthWrapper from "ui/public/FullWidthWrapper";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import { object } from "yup";

import { changeCheckbox, partitionGroupedOptions } from "../helpers";
import { useExclusiveOptionInGroupedChecklist } from "../hooks/useExclusiveOption";
import { useSortedOptions } from "../hooks/useSortedOptions";
import { ExclusiveChecklistItem } from "./ExclusiveChecklistItem";
import { GroupedChecklistOptions } from "./GroupedChecklistOptions";

const GroupedChecklistComponent: React.FC<PublicProps<GroupedChecklist>> = (
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

  const [exclusiveOptionGroups, nonExclusiveOptionGroups] =
    partitionGroupedOptions(groupedOptions!);

  const { exclusiveOrOptionGroup, toggleExclusiveCheckbox } =
    useExclusiveOptionInGroupedChecklist(exclusiveOptionGroups, formik);

  const toggleCheckbox = (id: string) =>
    changeCheckbox({
      id,
      setCheckedFieldValue,
      currentCheckedIds: formik.values.checked,
      exclusiveOrOption: exclusiveOrOptionGroup?.children[0],
      toggleExclusiveCheckbox,
      nonExclusiveOptions: nonExclusiveOptionGroups.flatMap(
        ({ children }) => children,
      ),
    });

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
            <legend style={visuallyHidden} id="whole-group-heading">
              {text}
            </legend>
            {nonExclusiveOptionGroups && (
              <GroupedChecklistOptions
                groupedOptions={nonExclusiveOptionGroups}
                previouslySubmittedData={previouslySubmittedData}
                changeCheckbox={toggleCheckbox}
                formik={formik}
              />
            )}
            <Box pt={1}>
              {exclusiveOrOptionGroup && (
                <ExclusiveChecklistItem
                  exclusiveOrOption={exclusiveOrOptionGroup?.children[0]}
                  changeCheckbox={toggleCheckbox}
                  formik={formik}
                />
              )}
            </Box>
          </Grid>
        </ErrorWrapper>
      </FullWidthWrapper>
    </Card>
  );
};

export default GroupedChecklistComponent;
