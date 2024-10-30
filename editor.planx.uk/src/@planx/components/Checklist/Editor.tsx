import Delete from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import adjust from "ramda/src/adjust";
import compose from "ramda/src/compose";
import remove from "ramda/src/remove";
import React, { useEffect, useRef } from "react";
import { FormikHookReturn } from "types";
import ImgInput from "ui/editor/ImgInput/ImgInput";
import InputGroup from "ui/editor/InputGroup";
import ListManager from "ui/editor/ListManager/ListManager";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import SimpleMenu from "ui/editor/SimpleMenu";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";

import { Option, parseBaseNodeData } from "../shared";
import { FlagsSelect } from "../shared/FlagsSelect";
import { ICONS } from "../shared/icons";
import type { Checklist, Group } from "./model";
import { toggleExpandableChecklist } from "./model";
import { ChecklistProps, OptionEditorProps } from "./types";

const OptionEditor: React.FC<OptionEditorProps> = (props) => {
  return (
    <div style={{ width: "100%" }}>
      <InputRow>
        {props.value.id ? (
          <input type="hidden" value={props.value.id} readOnly />
        ) : null}
        <InputRowItem width="200%">
          <Input
            required
            format="bold"
            value={props.value.data.text || ""}
            onChange={(ev) => {
              props.onChange({
                ...props.value,
                data: {
                  ...props.value.data,
                  text: ev.target.value,
                },
              });
            }}
            placeholder="Option"
          />
        </InputRowItem>

        <ImgInput
          img={props.value.data.img}
          onChange={(img) => {
            props.onChange({
              ...props.value,
              data: {
                ...props.value.data,
                img,
              },
            });
          }}
        />

        {typeof props.index !== "undefined" &&
          props.groups &&
          props.onMoveToGroup && (
            <SimpleMenu
              items={props.groups.map((group, groupIndex) => ({
                label: `Move to ${group || `group ${groupIndex}`}`,
                onClick: () => {
                  props.onMoveToGroup &&
                    typeof props.index === "number" &&
                    props.onMoveToGroup(props.index, groupIndex);
                },
                disabled: groupIndex === props.groupIndex,
              }))}
            />
          )}
      </InputRow>

      {props.showValueField && (
        <InputRow>
          <Input
            format="data"
            value={props.value.data.val || ""}
            placeholder="Data Value"
            onChange={(ev) => {
              props.onChange({
                ...props.value,
                data: {
                  ...props.value.data,
                  val: ev.target.value,
                },
              });
            }}
          />
        </InputRow>
      )}

      <FlagsSelect
        value={Array.isArray(props.value.data.flag) ? props.value.data.flag : [props.value.data.flag]}
        onChange={(ev) => {
          props.onChange({
            ...props.value,
            data: {
              ...props.value.data,
              flag: ev,
            },
          });
        }}
      />
    </div>
  );
};

const Options: React.FC<{ formik: FormikHookReturn }> = ({ formik }) => {
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
                    Editor={OptionEditor}
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
          values={formik.values.options || []}
          onChange={(newOptions) => {
            formik.setFieldValue("options", newOptions);
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
          Editor={OptionEditor}
          editorExtraProps={{ showValueField: !!formik.values.fn }}
        />
      )}
    </ModalSectionContent>
  );
};

export const ChecklistComponent: React.FC<ChecklistProps> = (props) => {
  const type = TYPES.Checklist;

  const formik = useFormik<Checklist>({
    initialValues: {
      allRequired: props.node?.data?.allRequired || false,
      neverAutoAnswer: props.node?.data?.neverAutoAnswer || false,
      description: props.node?.data?.description || "",
      fn: props.node?.data?.fn || "",
      groupedOptions: props.groupedOptions,
      img: props.node?.data?.img || "",
      options: props.options,
      text: props.node?.data?.text || "",
      ...parseBaseNodeData(props.node?.data),
    },
    onSubmit: ({ options, groupedOptions, ...values }) => {
      const sourceOptions = options?.length
        ? options
        : groupedOptions?.flatMap((group) => group.children);

      const filteredOptions = (sourceOptions || []).filter(
        (option) => option.data.text,
      );

      const processedOptions = filteredOptions.map((option) => ({
        ...option,
        id: option.id || undefined,
        type: TYPES.Answer,
      }));

      if (props.handleSubmit) {
        props.handleSubmit(
          {
            type,
            data: {
              ...values,
              ...(groupedOptions
                ? {
                  categories: groupedOptions.map((gr) => ({
                    title: gr.title,
                    count: gr.children.length,
                  })),
                }
                : {
                  categories: undefined,
                }),
            },
          },
          processedOptions,
        );
      } else {
        alert(JSON.stringify({ type, ...values, options }, null, 2));
      }
    },
    validate: () => { },
  });

  const focusRef = useRef<HTMLInputElement | null>(null);

  // horrible hack to remove focus from Rich Text Editor
  useEffect(() => {
    setTimeout(() => {
      (document.activeElement as any).blur();
      focusRef.current?.focus();
    }, 50);
  }, []);

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Checklist" Icon={ICONS[type]}>
          <InputGroup>
            <InputRow>
              <Input
                format="large"
                name="text"
                value={formik.values.text}
                placeholder="Text"
                onChange={formik.handleChange}
                inputRef={focusRef}
                required
              />

              <ImgInput
                img={formik.values.img}
                onChange={(newUrl) => {
                  formik.setFieldValue("img", newUrl);
                }}
              />
            </InputRow>

            <InputRow>
              <RichTextInput
                name="description"
                value={formik.values.description}
                placeholder="Description"
                onChange={formik.handleChange}
              />
            </InputRow>

            <InputRow>
              <Input
                format="data"
                name="fn"
                value={formik.values.fn}
                placeholder="Data Field"
                onChange={formik.handleChange}
              />
            </InputRow>
            <InputRow>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!formik.values.groupedOptions}
                    onChange={() =>
                      formik.setValues({
                        ...formik.values,
                        ...toggleExpandableChecklist({
                          options: formik.values.options,
                          groupedOptions: formik.values.groupedOptions,
                        }),
                      })
                    }
                  />
                }
                label="Expandable"
              />
            </InputRow>
            <InputRow>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.allRequired}
                    onChange={() =>
                      formik.setFieldValue(
                        "allRequired",
                        !formik.values.allRequired,
                      )
                    }
                  />
                }
                label="All required"
              />
            </InputRow>
            <InputRow>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.neverAutoAnswer}
                    onChange={() =>
                      formik.setFieldValue(
                        "neverAutoAnswer",
                        !formik.values.neverAutoAnswer,
                      )
                    }
                  />
                }
                label="Always put to user (forgo automation)"
              />
            </InputRow>
          </InputGroup>
        </ModalSectionContent>

        <Options formik={formik} />
      </ModalSection>

      <ModalFooter formik={formik} />
    </form>
  );
};

export default ChecklistComponent;
