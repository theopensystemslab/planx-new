import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { visuallyHidden } from "@mui/utils";
import {
  type Checklist,
  checklistValidationSchema,
  getFlatOptions,
  getLayout,
  type Group,
} from "@planx/components/Checklist/model";
import ImageButton from "@planx/components/shared/Buttons/ImageButton";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { getIn, useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useState } from "react";
import { ExpandableList, ExpandableListItem } from "ui/public/ExpandableList";
import FormWrapper from "ui/public/FormWrapper";
import FullWidthWrapper from "ui/public/FullWidthWrapper";
import ChecklistItem from "ui/shared/ChecklistItem/ChecklistItem";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import { object } from "yup";

import { Option } from "../shared";
import type { PublicProps } from "../shared/types";

export type Props = PublicProps<Checklist>;

export enum ChecklistLayout {
  Basic,
  Grouped,
  Images,
}

function toggleInArray<T>(value: T, arr: Array<T>): Array<T> {
  return arr.includes(value)
    ? arr.filter((val) => val !== value)
    : [...arr, value];
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

// An auto-answered Checklist won't be seen by the user, but still leaves a breadcrumb
const AutoAnsweredChecklist: React.FC<Props & { answerIds: string[] }> = (
  props,
) => {
  useEffect(() => {
    props.handleSubmit?.({
      answers: props.answerIds,
      auto: true,
    });
  }, []);

  return null;
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

  const initialExpandedGroups = getInitialExpandedGroups();

  const [expandedGroups, setExpandedGroups] = useState<Array<number>>(
    initialExpandedGroups,
  );

  const layout = getLayout({ options, groupedOptions });
  const flatOptions = getFlatOptions({ options, groupedOptions });

  const changeCheckbox = (id: string) => (_checked: any) => {
    let newCheckedIds;

    if (formik.values.checked.includes(id)) {
      newCheckedIds = formik.values.checked.filter((x) => x !== id);
    } else {
      newCheckedIds = [...formik.values.checked, id];
    }

    formik.setFieldValue(
      "checked",
      newCheckedIds.sort((a, b) => {
        const originalIds = flatOptions.map((cb) => cb.id);
        return originalIds.indexOf(a) - originalIds.indexOf(b);
      }),
    );
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
            {options &&
              options.map((option) =>
                layout === ChecklistLayout.Basic ? (
                  <FormWrapper key={option.id}>
                    <Grid item xs={12} key={option.data.text}>
                      <ChecklistItem
                        onChange={changeCheckbox(option.id)}
                        label={option.data.text}
                        id={option.id}
                        checked={formik.values.checked.includes(option.id)}
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
                            data-testid={`group-${index}${isExpanded ? "-expanded" : ""
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

  function getInitialExpandedGroups() {
    return (groupedOptions ?? ([] as Group<Option>[])).reduce(
      (acc, group, index) =>
        groupHasOptionSelected(group, previouslySubmittedData?.answers ?? [])
          ? [...acc, index]
          : acc,
      [] as number[],
    );

    function groupHasOptionSelected(group: Group<Option>, answers: string[]) {
      return group.children.some((child) =>
        answers.some((id) => child.id === id),
      );
    }
  }
};
export default ChecklistComponent;
