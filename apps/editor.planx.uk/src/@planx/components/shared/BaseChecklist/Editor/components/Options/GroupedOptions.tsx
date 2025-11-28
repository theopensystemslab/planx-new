import Delete from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { ComponentType } from "@opensystemslab/planx-core/types";
import { DEFAULT_RULE } from "@planx/components/ResponsiveChecklist/model";
import type {
  AnyChecklist,
  OptionGroup,
} from "@planx/components/shared/BaseChecklist/model";
import { getOptionsSchemaByFn } from "@planx/components/shared/utils";
import { FormikValues, getIn } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import adjust from "ramda/src/adjust";
import compose from "ramda/src/compose";
import remove from "ramda/src/remove";
import React from "react";
import { FormikHookReturn } from "types";
import ListManager from "ui/editor/ListManager/ListManager";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import { partitionGroupedOptions } from "../../../Public/helpers";
import { useCurrentOptions } from "../../../Public/hooks/useInitialOptions";
import { ExclusiveOrOptionManager } from "./ExclusiveOrOptionManager";
import ChecklistOptionsEditor from "./OptionsEditor";

interface Props<T extends FormikValues> {
  type: ComponentType.Checklist | ComponentType.ResponsiveChecklist;
  formik: FormikHookReturn<T>;
  disabled?: boolean;
  isTemplatedNode?: boolean;
}

export const GroupedOptions = <T extends AnyChecklist>({
  type,
  formik,
  disabled,
  isTemplatedNode,
}: Props<T>) => {
  const { schema, currentOptionVals } = useCurrentOptions(formik);

  // Type-narrowing only - groupedOptions will be defined here
  if (!formik.values.groupedOptions)
    throw Error("Required grouped options missing from component");

  const [exclusiveOptions, nonExclusiveOptionGroups] = partitionGroupedOptions(
    formik.values.groupedOptions,
  );

  const exclusiveOrOptionManagerShouldRender =
    nonExclusiveOptionGroups.length > 0;

  const isPlatformAdmin = useStore.getState().user?.isPlatformAdmin;
  const showAddDeleteButtons = !isTemplatedNode || isPlatformAdmin;

  return (
    <Box>
      {nonExclusiveOptionGroups.map((groupedOption, groupIndex: number) => (
        <Box
          key={groupIndex}
          mt={groupIndex === 0 ? 0 : 4}
          id={`group-${groupIndex}`}
          sx={(theme) => ({ scrollMarginTop: theme.spacing(1) })}
        >
          <Box display="flex" pb={1}>
            <InputRow>
              <Input
                errorMessage={getIn(
                  formik.errors,
                  `groupedOptions[${groupIndex}].title`,
                )}
                format="bold"
                name={`groupedOptions[${groupIndex}].title`}
                value={groupedOption.title}
                placeholder="Section Title"
                onChange={formik.handleChange}
                disabled={disabled}
              />
            </InputRow>
            {showAddDeleteButtons && (
              <Box flex={0}>
                <IconButton
                  title="Delete group"
                  aria-label="Delete group"
                  onClick={() => {
                    formik.setFieldValue(
                      `groupedOptions`,
                      remove(groupIndex, 1, formik.values.groupedOptions!),
                    );
                  }}
                  size="large"
                  disabled={disabled}
                >
                  <Delete />
                </IconButton>
              </Box>
            )}
          </Box>
          <Box>
            <ListManager
              values={groupedOption.children}
              onChange={(newOptions) => {
                formik.setFieldValue(
                  `groupedOptions[${groupIndex}].children`,
                  newOptions,
                );
              }}
              disabled={disabled}
              newValue={() => ({
                id: "",
                data: {
                  text: "",
                  description: "",
                  val: "",
                  flags: [],
                  ...(type === ComponentType.ResponsiveChecklist && {
                    rule: DEFAULT_RULE,
                  }),
                },
              })}
              newValueLabel="add new option"
              Editor={ChecklistOptionsEditor}
              editorExtraProps={{
                type,
                groupIndex,
                showValueField: !!formik.values.fn,
                showDescriptionField: true,
                onMoveToGroup: (
                  movedItemIndex: number,
                  moveToGroupIndex: number,
                ) => {
                  const item = groupedOption.children[movedItemIndex];
                  formik.setFieldValue(
                    "groupedOptions",
                    compose(
                      adjust(moveToGroupIndex, (option: OptionGroup) => ({
                        ...option,
                        children: [...option.children, item],
                      })),
                      adjust(groupIndex, (option) => ({
                        ...option,
                        children: remove(movedItemIndex, 1, option.children),
                      })),
                    )(formik.values.groupedOptions!),
                  );
                },
                groups: nonExclusiveOptionGroups.map((opt) => opt.title),
                schema: getOptionsSchemaByFn(
                  formik.values.fn,
                  schema,
                  currentOptionVals,
                ),
              }}
              isTemplatedNode={isTemplatedNode}
              collapsible={true}
            />
          </Box>
        </Box>
      ))}
      {showAddDeleteButtons && (
        <Box mt={1}>
          <Button
            size="large"
            disabled={disabled}
            onClick={() => {
              formik.setFieldValue(`groupedOptions`, [
                ...nonExclusiveOptionGroups,
                {
                  title: "",
                  children: [],
                },
                ...exclusiveOptions,
              ]);
            }}
          >
            add new group
          </Button>
        </Box>
      )}
      {exclusiveOrOptionManagerShouldRender ? (
        <ExclusiveOrOptionManager
          type={type}
          formik={formik}
          grouped
          exclusiveOptions={exclusiveOptions[0]?.children}
          nonExclusiveOptions={nonExclusiveOptionGroups}
          disabled={disabled}
          isTemplatedNode={isTemplatedNode}
        />
      ) : (
        <></>
      )}
    </Box>
  );
};
