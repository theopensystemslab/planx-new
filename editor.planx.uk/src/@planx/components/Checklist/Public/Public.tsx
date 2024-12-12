import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import {
  checklistValidationSchema,
  getFlatOptions,
  getLayout,
} from "@planx/components/Checklist/model";
import ImageButton from "@planx/components/shared/Buttons/ImageButton";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { getIn, useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import { ExpandableList, ExpandableListItem } from "ui/public/ExpandableList";
import FormWrapper from "ui/public/FormWrapper";
import FullWidthWrapper from "ui/public/FullWidthWrapper";
import ChecklistItem from "ui/shared/ChecklistItem/ChecklistItem";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import { object } from "yup";

import { Props } from "../types";
import { AutoAnsweredChecklist } from "./AutoAnsweredChecklist";
import {
  getInitialExpandedGroups,
  toggleCheckbox,
  toggleInArray,
} from "./helpers";

export enum ChecklistLayout {
  Basic,
  Grouped,
  Images,
}

const ChecklistComponent: React.FC<Props> = (props) => {
  const autoAnswerableOptions = useStore(
    (state) => state.autoAnswerableOptions,
  );

  if (props.neverAutoAnswer) {
    return <VisibleChecklist {...props} />;
  }

  let idsThatCanBeAutoAnswered: string[] | undefined;
  if (props.id) idsThatCanBeAutoAnswered = autoAnswerableOptions(props.id);
  if (idsThatCanBeAutoAnswered) {
    return (
      <AutoAnsweredChecklist {...props} answerIds={idsThatCanBeAutoAnswered} />
    );
  }

  return <VisibleChecklist {...props} />;
};

const VisibleChecklist: React.FC<Props> = (props) => {
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

  const initialExpandedGroups = getInitialExpandedGroups(
    groupedOptions,
    previouslySubmittedData,
  );

  const [expandedGroups, setExpandedGroups] = useState<Array<number>>(
    initialExpandedGroups,
  );

  const layout = getLayout({ options, groupedOptions });
  const flatOptions = getFlatOptions({ options, groupedOptions });

  const sortCheckedIds = (ids: string[]): string[] => {
    const originalIds = flatOptions.map((cb) => cb.id);
    return ids.sort((a, b) => originalIds.indexOf(a) - originalIds.indexOf(b));
  };

  const exclusiveOrOption =
    options?.find((option) => option.data?.exclusive === true) || undefined;

  const exclusiveOptionIsChecked =
    exclusiveOrOption && formik.values.checked.includes(exclusiveOrOption.id);

  const changeCheckbox = (id: string) => () => {
    const currentIds = formik.values.checked;
    let newCheckedIds;
    const currentCheckboxIsExclusiveOption =
      exclusiveOrOption && id === exclusiveOrOption.id;

    if (currentCheckboxIsExclusiveOption) {
      newCheckedIds = exclusiveOptionIsChecked ? [] : [id];
    } else if (exclusiveOrOption) {
      newCheckedIds = toggleCheckbox(id, currentIds);
      const onlyNonExclusiveOptions = newCheckedIds.filter(
        (id: string) => exclusiveOrOption && id !== exclusiveOrOption.id,
      );
      newCheckedIds = onlyNonExclusiveOptions;
    } else {
      newCheckedIds = toggleCheckbox(id, currentIds);
    }
    const sortedCheckedIds = sortCheckedIds(newCheckedIds);
    formik.setFieldValue("checked", sortedCheckedIds);
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
            {options
              ?.filter((option) => option.data.exclusive !== true)
              .map((option) =>
                layout === ChecklistLayout.Basic ? (
                  <FormWrapper key={option.id}>
                    <Grid item xs={12} key={option.data.text}>
                      <ChecklistItem
                        onChange={changeCheckbox(option.id)}
                        label={option.data.text}
                        id={option.id}
                        checked={
                          formik.values.checked.includes(option.id) &&
                          !exclusiveOptionIsChecked
                        }
                      />
                    </Grid>
                  </FormWrapper>
                ) : (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    contentWrap={4}
                    key={option.data.text}
                  >
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
            {exclusiveOrOption && (
              <FormWrapper key={exclusiveOrOption.id}>
                <Grid item xs={12} key={exclusiveOrOption.data.text}>
                  <Typography width={36} display="flex" justifyContent="center">
                    or
                  </Typography>

                  <ChecklistItem
                    onChange={changeCheckbox(exclusiveOrOption.id)}
                    label={exclusiveOrOption.data.text}
                    id={exclusiveOrOption.id}
                    checked={formik.values.checked.includes(
                      exclusiveOrOption.id,
                    )}
                  />
                </Grid>
              </FormWrapper>
            )}

            {groupedOptions && (
              <FormWrapper>
                <Grid item xs={12}>
                  <ExpandableList>
                    {groupedOptions.map((group, index) => {
                      const isExpanded = expandedGroups.includes(index);
                      return (
                        <ExpandableListItem
                          key={index}
                          expanded={isExpanded}
                          onToggle={() => {
                            setExpandedGroups((previous) =>
                              toggleInArray(index, previous),
                            );
                          }}
                          headingId={`group-${index}-heading`}
                          groupId={`group-${index}-content`}
                          title={group.title}
                        >
                          <Box
                            pt={0.5}
                            pb={2}
                            aria-labelledby={`group-${index}-heading`}
                            id={`group-${index}-content`}
                            data-testid={`group-${index}${
                              isExpanded ? "-expanded" : ""
                            }`}
                          >
                            {group.children.map((option) => (
                              <ChecklistItem
                                onChange={changeCheckbox(option.id)}
                                key={option.data.text}
                                label={option.data.text}
                                id={option.id}
                                checked={formik.values.checked.includes(
                                  option.id,
                                )}
                              />
                            ))}
                          </Box>
                        </ExpandableListItem>
                      );
                    })}
                  </ExpandableList>
                </Grid>
              </FormWrapper>
            )}
          </Grid>
        </ErrorWrapper>
      </FullWidthWrapper>
    </Card>
  );
};
export default ChecklistComponent;
