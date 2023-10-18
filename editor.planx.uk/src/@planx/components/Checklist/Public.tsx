import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import type { Checklist, Group } from "@planx/components/Checklist/model";
import ImageButton from "@planx/components/shared/Buttons/ImageButton";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { useFormik } from "formik";
import React, { useState } from "react";
import ChecklistItem from "ui/ChecklistItem";
import ErrorWrapper from "ui/ErrorWrapper";
import { ExpandableList, ExpandableListItem } from "ui/ExpandableList";
import FormWrapper from "ui/FormWrapper";
import FullWidthWrapper from "ui/FullWidthWrapper";
import { array, object } from "yup";

import { Option } from "../shared";
import type { PublicProps } from "../ui";

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

function getFlatOptions({
  options,
  groupedOptions,
}: {
  options: Checklist["options"];
  groupedOptions: Checklist["groupedOptions"];
}) {
  if (options) {
    return options;
  }
  if (groupedOptions) {
    return groupedOptions.flatMap((group) => group.children);
  }
  return [];
}

const ChecklistComponent: React.FC<Props> = ({
  allRequired,
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
}) => {
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
      checked: array()
        .required()
        .test({
          name: "atLeastOneChecked",
          message: "Select at least one option",
          test: (checked?: Array<string>) => {
            return Boolean(checked && checked.length > 0);
          },
        })
        .test({
          name: "notAllChecked",
          message: "All options must be checked",
          test: (checked?: Array<string>) => {
            if (!allRequired) {
              return true;
            }
            const flatOptions = getFlatOptions({ options, groupedOptions });
            const allChecked = checked && checked.length === flatOptions.length;
            return Boolean(allChecked);
          },
        }),
    }),
  });

  const initialExpandedGroups = getInitialExpandedGroups();

  const [expandedGroups, setExpandedGroups] = useState<Array<number>>(
    initialExpandedGroups,
  );

  const layout = options
    ? options.find((o) => o.data.img)
      ? ChecklistLayout.Images
      : ChecklistLayout.Basic
    : groupedOptions
    ? ChecklistLayout.Grouped
    : ChecklistLayout.Basic;

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
      <QuestionHeader
        title={text}
        description={description}
        info={info}
        policyRef={policyRef}
        howMeasured={howMeasured}
        img={img}
      />
      <FullWidthWrapper>
        <ErrorWrapper error={formik.errors.checked} id={id}>
          <Grid container spacing={layout === ChecklistLayout.Images ? 2 : 0}>
            {options ? (
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
              )
            ) : groupedOptions ? (
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
            ) : null}
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
