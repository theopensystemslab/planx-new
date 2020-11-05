import Button from "@material-ui/core/Button";
import { useFormik } from "formik";
import React, { useState } from "react";

import { ExpandableList, ExpandableListItem } from "../../../../ui";
import { Group, Option } from "../../../FlowEditor/data/types";
import Card from "../shared/Card";
import QuestionHeader from "../shared/QuestionHeader";
import InnerCheckbox from "./InnerCheckbox";

interface Props {
  allRequired?: boolean;
  description?: string;
  groupedOptions?: Array<Group<Option>>;
  handleSubmit?;
  howMeasured?: string;
  info?: string;
  options?: Array<Option>;
  policyRef?: string;
  text: string;
}

function toggleInArray<T>(value: T, arr: Array<T>): Array<T> {
  return arr.includes(value)
    ? arr.filter((val) => val !== value)
    : [...arr, value];
}

const Checklist: React.FC<Props> = ({
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
        <QuestionHeader
          title={text}
          description={description}
          info={info}
          policyRef={policyRef}
          howMeasured={howMeasured}
        />

        {options ? (
          options.map((cb: any) => (
            <InnerCheckbox
              changeCheckbox={changeCheckbox}
              key={cb.data.text}
              label={cb.data.text}
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
                    {group.children.map((option: any) => (
                      <InnerCheckbox
                        changeCheckbox={changeCheckbox}
                        key={option.data.text}
                        label={option.data.text}
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
export default Checklist;
