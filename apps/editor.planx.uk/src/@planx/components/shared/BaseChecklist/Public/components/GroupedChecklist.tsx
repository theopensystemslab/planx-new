import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import {
  checklistInputValidationSchema,
  type GroupedChecklist,
} from "@planx/components/Checklist/model";
import ImageButton from "@planx/components/shared/Buttons/ImageButton";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { PublicProps } from "@planx/components/shared/types";
import { getIn, useFormik } from "formik";
import React, { useEffect } from "react";
import FormWrapper from "ui/public/FormWrapper";
import FullWidthWrapper from "ui/public/FullWidthWrapper";
import ChecklistItem from "ui/shared/ChecklistItem/ChecklistItem";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import { object } from "yup";

import { changeCheckbox, partitionGroupedOptions } from "../helpers";
import { useExclusiveOptionInGroupedChecklist } from "../hooks/useExclusiveOption";
import { useSortedOptions } from "../hooks/useSortedOptions";
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

  const hasImages =
    groupedOptions?.some((group) =>
      group.children.some((option) => option.data?.img),
    ) || false;

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
          <Box
            component="fieldset"
            sx={hasImages ? { width: "100%" } : undefined}
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
                layout={layout}
              />
            )}
          </Box>
        </ErrorWrapper>
        {exclusiveOrOptionGroup && (
          <ErrorWrapper error={getIn(formik.errors, "checked")} id={id}>
            <Grid container spacing={hasImages ? 2 : 0} component="fieldset">
              <Grid item xs={12}>
                <Box width={40} pt={1}>
                  <Typography align="center">or</Typography>
                </Box>
              </Grid>
              <p id="exclusive-option-explanation" style={visuallyHidden}>
                Selecting this option will deselect all other options.
              </p>
              {hasImages ? (
                <Grid item xs={12} sm={6} md={4}>
                  <ImageButton
                    title={exclusiveOrOptionGroup.children[0].data.text}
                    id={exclusiveOrOptionGroup.children[0].id}
                    img={exclusiveOrOptionGroup.children[0].data.img}
                    selected={formik.values.checked.includes(
                      exclusiveOrOptionGroup.children[0].id,
                    )}
                    onClick={toggleCheckbox(
                      exclusiveOrOptionGroup.children[0].id,
                    )}
                    checkbox
                  />
                </Grid>
              ) : (
                <FormWrapper>
                  <Grid item xs={12}>
                    <ChecklistItem
                      onChange={toggleCheckbox(
                        exclusiveOrOptionGroup.children[0].id,
                      )}
                      label={exclusiveOrOptionGroup.children[0].data.text}
                      id={exclusiveOrOptionGroup.children[0].id}
                      checked={formik.values.checked.includes(
                        exclusiveOrOptionGroup.children[0].id,
                      )}
                      inputProps={{
                        "aria-describedby": "exclusive-option-explanation",
                      }}
                    />
                  </Grid>
                </FormWrapper>
              )}
            </Grid>
          </ErrorWrapper>
        )}
      </FullWidthWrapper>
    </Card>
  );
};

export default GroupedChecklistComponent;
