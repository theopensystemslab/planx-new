import Grid from "@mui/material/Grid";
import { visuallyHidden } from "@mui/utils";
import {
  ChecklistLayout,
  getLayout,
  groupedChecklistValidationSchema,
} from "@planx/components/Checklist/model";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { getIn, useFormik } from "formik";
import React, { useEffect } from "react";
import FullWidthWrapper from "ui/public/FullWidthWrapper";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import { object } from "yup";

import { PublicChecklistProps } from "../../types";
import { GroupedChecklistOptions } from "./grouped/GroupedChecklistOptions";

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

  const formik = useFormik<{ checked: Record<string, Array<string>> }>({
    initialValues: {
      // e.g. { 'Section 1': [], 'Section 2': [ 'S2_Option2' ] }
      checked:
        groupedOptions?.reduce(
          (acc, group) => ({
            ...acc,
            [group.title]:
              previouslySubmittedData?.answers?.filter((id) =>
                group.children.some((item) => item.id === id),
              ) || [],
          }),
          {},
        ) || {},
    },
    onSubmit: (values) => {
      const flattenedCheckedIds = Object.values(values.checked).flat();
      handleSubmit?.({ answers: flattenedCheckedIds });
    },
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: object({
      checked: groupedChecklistValidationSchema(props),
    }),
  });

  // TODO: do we need useSortedOptions ?
  const layout = getLayout({ options, groupedOptions });

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
            {groupedOptions && (
              <GroupedChecklistOptions
                groupedOptions={groupedOptions}
                previouslySubmittedData={previouslySubmittedData}
                formik={formik}
              />
            )}
          </Grid>
        </ErrorWrapper>
      </FullWidthWrapper>
    </Card>
  );
};
