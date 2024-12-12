import Delete from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { BaseOptionsEditor } from "@planx/components/shared/BaseOptionsEditor";
import adjust from "ramda/src/adjust";
import compose from "ramda/src/compose";
import remove from "ramda/src/remove";
import React from "react";
import { FormikHookReturn } from "types";
import ListManager from "ui/editor/ListManager/ListManager";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import { Option } from "../../shared";
import type { Group } from "../model";
import ChecklistOptionsEditor from "./OptionsEditor";

export const Options: React.FC<{ formik: FormikHookReturn }> = ({ formik }) => {
  const exclusiveOrOptionManagerShouldRender =
    formik.values.options?.filter((opt: Option) => opt.data.exclusive !== true)
      .length > 0;

  return (
    <ModalSectionContent subtitle="Options">
      {formik.values.groupedOptions ? (
        <Box>
          {formik.values.groupedOptions.map(
            (groupedOption: Group<Option>, groupIndex: number) => (
              <Box key={groupIndex} mt={groupIndex === 0 ? 0 : 4}>
                <Box display="flex" pb={1}>
                  <InputRow>
                    <Input
                      required
                      format="bold"
                      name={`groupedOptions[${groupIndex}].title`}
                      value={groupedOption.title}
                      placeholder="Section Title"
                      onChange={formik.handleChange}
                    />
                  </InputRow>
                  <Box flex={0}>
                    <IconButton
                      title="Delete group"
                      aria-label="Delete group"
                      onClick={() => {
                        formik.setFieldValue(
                          `groupedOptions`,
                          remove(groupIndex, 1, formik.values.groupedOptions),
                        );
                      }}
                      size="large"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
                <Box pl={{ md: 2 }}>
                  <ListManager
                    values={groupedOption.children}
                    onChange={(newOptions) => {
                      formik.setFieldValue(
                        `groupedOptions[${groupIndex}].children`,
                        newOptions,
                      );
                    }}
                    newValue={() =>
                      ({
                        data: {
                          text: "",
                          description: "",
                          val: "",
                        },
                      }) as Option
                    }
                    newValueLabel="add new option"
                    Editor={ChecklistOptionsEditor}
                    editorExtraProps={{
                      groupIndex,
                      showValueField: !!formik.values.fn,
                      onMoveToGroup: (
                        movedItemIndex: number,
                        moveToGroupIndex: number,
                      ) => {
                        const item = groupedOption.children[movedItemIndex];
                        formik.setFieldValue(
                          "groupedOptions",
                          compose(
                            adjust(
                              moveToGroupIndex,
                              (option: Group<Option>) => ({
                                ...option,
                                children: [...option.children, item],
                              }),
                            ),
                            adjust(groupIndex, (option: Group<Option>) => ({
                              ...option,
                              children: remove(
                                movedItemIndex,
                                1,
                                option.children,
                              ),
                            })),
                          )(formik.values.groupedOptions),
                        );
                      },
                      groups: formik.values.groupedOptions.map(
                        (opt: Group<Option>) => opt.title,
                      ),
                    }}
                  />
                </Box>
              </Box>
            ),
          )}
          <Box mt={1}>
            <Button
              size="large"
              onClick={() => {
                formik.setFieldValue(`groupedOptions`, [
                  ...formik.values.groupedOptions,
                  {
                    title: "",
                    children: [],
                  },
                ]);
              }}
            >
              add new group
            </Button>
          </Box>
        </Box>
      ) : (
        <ListManager
          values={
            formik.values.options?.filter(
              (opt: Option) => !opt.data.exclusive,
            ) || []
          }
          onChange={(newOptions) => {
            const exclusiveOptions =
              formik.values.options?.filter(
                (opt: Option) => opt.data.exclusive,
              ) || [];

            const newCombinedOptions =
              newOptions.length === 0
                ? []
                : [...exclusiveOptions, ...newOptions];

            formik.setFieldValue("options", newCombinedOptions);
          }}
          newValueLabel="add new option"
          newValue={() =>
            ({
              data: {
                text: "",
                description: "",
                val: "",
              },
            }) as Option
          }
          Editor={ChecklistOptionsEditor}
          editorExtraProps={{ showValueField: !!formik.values.fn }}
        />
      )}
      {exclusiveOrOptionManagerShouldRender ? (
        <Box mt={1}>
          <ListManager
            values={
              formik.values.options?.filter(
                (opt: Option) => opt.data.exclusive,
              ) || []
            }
            onChange={(newExclusiveOptions) => {
              const nonExclusiveOptions: Option[] =
                formik.values.options?.filter(
                  (opt: Option) => !opt.data.exclusive,
                ) || [];

              const newCombinedOptions = [
                ...nonExclusiveOptions,
                ...newExclusiveOptions,
              ];

              formik.setFieldValue("options", newCombinedOptions);
            }}
            newValueLabel='add "or" option'
            maxItems={1}
            newValue={() =>
              ({
                data: {
                  text: "",
                  description: "",
                  val: "",
                  exclusive: true,
                },
              }) as Option
            }
            Editor={BaseOptionsEditor}
            editorExtraProps={{ showValueField: !!formik.values.fn }}
          />
        </Box>
      ) : (
        <></>
      )}
    </ModalSectionContent>
  );
};
