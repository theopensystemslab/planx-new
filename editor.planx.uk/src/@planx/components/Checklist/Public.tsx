import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import type { Checklist } from "@planx/components/Checklist/model";
import ImageButton from "@planx/components/shared/Buttons/ImageButton";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { useFormik } from "formik";
import React, { useState } from "react";
import ChecklistItem from "ui/ChecklistItem";
import ErrorWrapper from "ui/ErrorWrapper";
import { ExpandableList, ExpandableListItem } from "ui/ExpandableList";
import { array, object } from "yup";

import type { PublicProps } from "../ui";

export type Props = PublicProps<Checklist>;

enum Layout {
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
    return groupedOptions.flatMap((group: any) => group.children);
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
}) => {
  const formik = useFormik<{ checked: Array<string> }>({
    initialValues: {
      checked: [],
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
          message: "At least one option must be checked",
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

  const [expandedGroups, setExpandedGroups] = useState<Array<number>>([]);

  const layout = options
    ? options.find((o) => o.data.img)
      ? Layout.Images
      : Layout.Basic
    : groupedOptions
    ? Layout.Grouped
    : Layout.Basic;

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
      })
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

      <ErrorWrapper error={formik.errors.checked}>
        <Grid container spacing={layout === Layout.Images ? 1 : 0}>
          {options ? (
            options.map((option: any) =>
              layout === Layout.Basic ? (
                <Grid item xs={12} key={option.data.text}>
                  <ChecklistItem
                    onChange={changeCheckbox(option.id)}
                    label={option.data.text}
                    id={option.id}
                    checked={formik.values.checked.includes(option.id)}
                  />
                </Grid>
              ) : (
                <Grid item xs={12} sm={6} key={option.data.text}>
                  <ImageButton
                    title={option.data.text}
                    img={option.data.img}
                    selected={formik.values.checked.includes(option.id)}
                    onClick={changeCheckbox(option.id)}
                    checkbox
                  />
                </Grid>
              )
            )
          ) : groupedOptions ? (
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
                          toggleInArray(index, previous)
                        );
                      }}
                      title={group.title}
                    >
                      <Box py={2}>
                        {group.children.map((option: any) => (
                          <ChecklistItem
                            onChange={changeCheckbox(option.id)}
                            key={option.data.text}
                            label={option.data.text}
                            id={option.id}
                            checked={formik.values.checked.includes(option.id)}
                          />
                        ))}
                      </Box>
                    </ExpandableListItem>
                  );
                })}
              </ExpandableList>
            </Grid>
          ) : null}
        </Grid>
      </ErrorWrapper>
    </Card>
  );
};
export default ChecklistComponent;
