import Button from "@material-ui/core/Button";
import { Checklist } from "@planx/components/Checklist/types";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { useFormik } from "formik";
import type { handleSubmit } from "pages/Preview/Node";
import React, { useState } from "react";
import Checkbox from "ui/Checkbox";

import { ExpandableList, ExpandableListItem } from "../../../../ui";

interface Props extends Checklist {
  handleSubmit: handleSubmit;
}

function toggleInArray<T>(value: T, arr: Array<T>): Array<T> {
  return arr.includes(value)
    ? arr.filter((val) => val !== value)
    : [...arr, value];
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
}) => {
  const formik = useFormik({
    initialValues: {
      checked: [],
    },
    onSubmit: (values) => {
      if (handleSubmit) handleSubmit(values.checked);
    },
    validate: () => {},
  });

  const [expandedGroups, setExpandedGroups] = useState<Array<number>>([0]);

  const flatOptions = options
    ? options
    : groupedOptions
    ? groupedOptions.flatMap((group) => group.children)
    : [];

  const allChecked = formik.values.checked.length === flatOptions.length;

  const changeCheckbox = (id: string) => (_checked: boolean) => {
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
        return originalIds.indexOf(b) - originalIds.indexOf(a);
      })
    );
  };

  return (
    <Card>
      <form onSubmit={formik.handleSubmit}>
        <QuestionHeader
          title={text}
          description={description}
          info={info}
          policyRef={policyRef}
          howMeasured={howMeasured}
        />

        {options ? (
          options.map((option: any) => (
            <Checkbox
              onChange={changeCheckbox(option.id)}
              key={option.data.text}
              label={option.data.text}
              id={option.id}
              checked={formik.values.checked.includes(option.id)}
            />
          ))
        ) : groupedOptions ? (
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
                  <div>
                    {group.children.map((option: any) => (
                      <Checkbox
                        onChange={changeCheckbox(option.id)}
                        key={option.data.text}
                        label={option.data.text}
                        id={option.id}
                        checked={formik.values.checked.includes(option.id)}
                      />
                    ))}
                  </div>
                </ExpandableListItem>
              );
            })}
          </ExpandableList>
        ) : null}
        <Button
          disabled={allRequired && !allChecked}
          variant="contained"
          color="primary"
          size="large"
          type="submit"
        >
          Continue
        </Button>
      </form>
    </Card>
  );
};
export default ChecklistComponent;
