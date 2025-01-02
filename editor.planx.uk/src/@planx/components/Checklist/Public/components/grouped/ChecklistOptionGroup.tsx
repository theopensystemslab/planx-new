import Box from "@mui/material/Box";
import { Group } from "@planx/components/Checklist/model";
import { FormikProps } from "formik";
import { partition } from "lodash";
import React from "react";
import { ExpandableListItem } from "ui/public/ExpandableList";
import ChecklistItem from "ui/shared/ChecklistItem/ChecklistItem";

import { Option } from "../../../../shared";
import { toggleNonExclusiveCheckbox } from "../../helpers";
import { useExclusiveOption } from "../../hooks/useExclusiveOption";
import { ExclusiveChecklistItem } from "../ExclusiveChecklistItem";

interface Props {
  group: Group<Option>;
  index: number;
  isExpanded: boolean;
  formik: FormikProps<{
    checked: Array<string>;
  }>;
  setCheckedFieldValue: (optionIds: string[]) => void;
  toggleGroup: (index: number) => void;
}

export const ChecklistOptionGroup = ({
  group,
  index,
  isExpanded,
  formik,
  setCheckedFieldValue,
  toggleGroup,
}: Props) => {
  const [exclusiveOptions, nonExclusiveOptions]: Option[][] = partition(
    group.children,
    (option: Option) => option.data.exclusive
  );

  const { exclusiveOrOption, toggleExclusiveCheckbox } = useExclusiveOption(
    exclusiveOptions,
    formik
  );

  const changeCheckbox = (id: string) => () => {
    const currentCheckedIds = formik.values.checked;

    const currentCheckboxIsExclusiveOption =
      exclusiveOrOption && id === exclusiveOrOption.id;

    if (currentCheckboxIsExclusiveOption) {
      const newCheckedIds = toggleExclusiveCheckbox(id);
      setCheckedFieldValue(newCheckedIds);
      return;
    }
    const newCheckedIds = toggleNonExclusiveCheckbox(
      id,
      currentCheckedIds,
      exclusiveOrOption
    );
    setCheckedFieldValue(newCheckedIds);
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
            checked={formik.values.checked.includes(option.id)}
          />
        ))}
        {exclusiveOrOption && (
          <ExclusiveChecklistItem
            exclusiveOrOption={exclusiveOrOption}
            changeCheckbox={changeCheckbox}
            formik={formik}
          />
        )}
      </Box>
    </ExpandableListItem>
  );
};
