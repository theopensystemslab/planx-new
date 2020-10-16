import Button from "@material-ui/core/Button";
import { useFormik } from "formik";
import React, { useState } from "react";

import { ExpandableList, ExpandableListItem } from "../../../../ui";
import { Group, Option } from "../../../FlowEditor/data/types";
import Card from "../shared/Card";
import QuestionHeader from "../shared/QuestionHeader";
import InnerCheckbox from "./InnerCheckbox";

interface ICheckboxes {
  text: string;
  options?: Array<Option>;
  groupedOptions?: Array<Group<Option>>;
  allRequired?: boolean;
  handleSubmit?;
  description?: string;
  info?: string;
}

function toggleInArray<T>(value: T, arr: Array<T>): Array<T> {
  return arr.includes(value)
    ? arr.filter((val) => val !== value)
    : [...arr, value];
}

const Checkboxes: React.FC<ICheckboxes> = ({
  options,
  groupedOptions,
  text,
  handleSubmit,
  description = "",
  allRequired,
  info,
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

  const changeCheckbox = (input) => {
    const { current } = input;

    let newCheckedIds;

    if (formik.values.checked.includes(current.value)) {
      newCheckedIds = formik.values.checked.filter((x) => x !== current.value);
    } else {
      newCheckedIds = [...formik.values.checked, current.value];
    }

    formik.setFieldValue(
      "checked",
      newCheckedIds.sort((a, b) => {
        const originalIds = flatOptions.map((cb) => cb.id);
        return originalIds.indexOf(b) - originalIds.indexOf(a);
      })
    );

    return (current.checked = !current.checked);
  };

  return (
    <Card>
      <form onSubmit={formik.handleSubmit}>
        <QuestionHeader title={text} description={description} info={info} />

        {options ? (
          options.map((cb) => (
            <InnerCheckbox
              changeCheckbox={changeCheckbox}
              key={cb.text}
              label={cb.text}
              value={cb.id}
            />
          ))
        ) : groupedOptions ? (
          <ExpandableList>
            {groupedOptions.map((group, index) => {
              const isExpanded = expandedGroups.includes(index);
              return (
                <ExpandableListItem
                  expanded={isExpanded}
                  onToggle={() => {
                    setExpandedGroups((previous) =>
                      toggleInArray(index, previous)
                    );
                  }}
                  title={group.title}
                >
                  <div>
                    {group.children.map((option) => (
                      <InnerCheckbox
                        changeCheckbox={changeCheckbox}
                        key={option.text}
                        label={option.text}
                        value={option.id}
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
export default Checkboxes;
