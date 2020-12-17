import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import type { Checklist } from "@planx/components/Checklist/model";
import ImageButton from "@planx/components/shared/Buttons/ImageButton";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { ROOT_NODE_KEY } from "@planx/graph";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import type { handleSubmit } from "pages/Preview/Node";
import React, { useState } from "react";
import ChecklistItem from "ui/ChecklistItem";
import { ExpandableList, ExpandableListItem } from "ui/ExpandableList";

interface Props extends Checklist {
  handleSubmit: handleSubmit;
}

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
  const page = useStore((state) => state.page);
  // TODO: do we still need formik here?

  const formik = useFormik<{ checked: Array<string> }>({
    initialValues: {
      checked: [],
    },
    onSubmit: (values) => {
      // submit handled by Card component
      // TODO: check if there are any async requirements
    },
    validate: () => {},
  });

  const [expandedGroups, setExpandedGroups] = useState<Array<number>>([0]);

  const layout = options
    ? options.find((o) => o.data.img)
      ? Layout.Images
      : Layout.Basic
    : groupedOptions
    ? Layout.Grouped
    : Layout.Basic;

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

    const newValues = newCheckedIds.sort((a, b) => {
      const originalIds = flatOptions.map((cb) => cb.id);
      return originalIds.indexOf(a) - originalIds.indexOf(b);
    });

    formik.setFieldValue("checked", newValues);

    if (page !== ROOT_NODE_KEY) handleSubmit(newValues);
  };

  return (
    <Card
      isValid={!allRequired || allChecked}
      handleSubmit={
        page === ROOT_NODE_KEY
          ? () => handleSubmit(formik.values.checked)
          : undefined
      }
    >
      <QuestionHeader
        title={text}
        description={description}
        info={info}
        policyRef={policyRef}
        howMeasured={howMeasured}
        img={img}
      />

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
    </Card>
  );
};
export default ChecklistComponent;
