import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { Group } from "@planx/components/Checklist/model";
import { FormikProps } from "formik";
import { partition } from "lodash";
import React from "react";
import { ExpandableListItem } from "ui/public/ExpandableList";
import FormWrapper from "ui/public/FormWrapper";
import ChecklistItem from "ui/shared/ChecklistItem/ChecklistItem";

import { Option } from "../../../shared";
import { toggleNonExclusiveCheckbox } from "../helpers";
import { useExclusiveOptionInGroupedChecklists } from "../hooks/useExclusiveOption";

interface Props {
  group: Group<Option>;
  index: number;
  isExpanded: boolean;
  formik: FormikProps<{
    checked: Record<string, Array<string>>;
  }>;
  toggleGroup: (index: number) => void;
}

export const ChecklistOptionGroup = ({
  group,
  index,
  isExpanded,
  formik,
  toggleGroup,
}: Props) => {
  const [exclusiveOptions, nonExclusiveOptions]: Option[][] = partition(
    group.children,
    (option: Option) => option.data.exclusive
  );

  const { exclusiveOrOption, toggleExclusiveCheckbox } =
    useExclusiveOptionInGroupedChecklists(
      exclusiveOptions,
      group.title,
      formik
    );

  const changeCheckbox = (id: string) => () => {
    const allCheckedIds = formik.values.checked;
    const currentCheckedIds = allCheckedIds[group.title];

    const currentCheckboxIsExclusiveOption =
      exclusiveOrOption && id === exclusiveOrOption.id;

    if (currentCheckboxIsExclusiveOption) {
      const newCheckedIds = toggleExclusiveCheckbox(id);
      formik.setFieldValue("checked", newCheckedIds);
      return;
    }
    const newCheckedIds = toggleNonExclusiveCheckbox(
      id,
      currentCheckedIds,
      exclusiveOrOption
    );

    allCheckedIds[group.title] = newCheckedIds;

    formik.setFieldValue("checked", allCheckedIds);
  };

  return (
    <ExpandableListItem
      key={index}
      expanded={isExpanded}
      onToggle={() => toggleGroup(index)}
      headingId={`group-${index}-heading`}
      groupId={`group-${index}-content`}
      title={group.title}
    >
      <Box
        pt={0.5}
        pb={2}
        aria-labelledby={`group-${index}-heading`}
        id={`group-${index}-content`}
        data-testid={`group-${index}${isExpanded ? "-expanded" : ""}`}
      >
        {nonExclusiveOptions.map((option) => (
          <ChecklistItem
            onChange={changeCheckbox(option.id)}
            key={option.data.text}
            label={option.data.text}
            id={option.id}
            checked={formik.values.checked[group.title].includes(option.id)}
          />
        ))}
        {exclusiveOrOption && (
          // Exclusive or option
          <FormWrapper key={exclusiveOrOption.id}>
            <Grid item xs={12} key={exclusiveOrOption.data.text}>
              <Typography width={36} display="flex" justifyContent="center">
                or
              </Typography>
              <ChecklistItem
                onChange={changeCheckbox(exclusiveOrOption.id)}
                label={exclusiveOrOption.data.text}
                id={exclusiveOrOption.id}
                checked={formik.values.checked[group.title].includes(
                  exclusiveOrOption.id
                )}
              />
            </Grid>
          </FormWrapper>
        )}
      </Box>
    </ExpandableListItem>
  );
};
