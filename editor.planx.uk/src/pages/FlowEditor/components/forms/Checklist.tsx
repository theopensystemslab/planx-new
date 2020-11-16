import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Delete from "@material-ui/icons/Delete";
import { useFormik } from "formik";
import adjust from "ramda/src/adjust";
import compose from "ramda/src/compose";
import remove from "ramda/src/remove";
import React, { useEffect, useRef } from "react";

import { TYPES } from "../../../../planx-nodes/types";
import { FormikHookReturn } from "../../../../types";
import {
  ImgInput,
  Input,
  InputGroup,
  InputRow,
  InputRowItem,
  InternalNotes,
  ListManager,
  ModalSection,
  ModalSectionContent,
  OptionButton,
  RichTextInput,
  SimpleMenu,
} from "../../../../ui";
import {
  Checklist,
  Group,
  Option,
  parseMoreInformation,
  toggleExpandableChecklist,
} from "../../data/types";
import { ICONS } from "../shared";
import { MoreInformation, PermissionSelect } from "./shared";

interface ChecklistOption {
  id?: string;
  data: {
    description?: string;
    flag?: string;
    img?: string;
    text?: string;
    val?: string;
  };
}

interface ChecklistProps extends Checklist {
  handleSubmit?: Function;
  node?: {
    data?: {
      allRequired?: boolean;
      categories?: any;
      definitionImg?: string;
      description?: string;
      fn?: string;
      howMeasured?: string;
      img?: string;
      info?: string;
      notes?: string;
      policyRef?: string;
      text?: string;
    };
  };
}

const OptionEditor: React.FC<{
  index?: number;
  value: ChecklistOption;
  onChange: (newVal: ChecklistOption) => void;
  groupIndex?: number;
  groups?: Array<string>;
  onMoveToGroup?: (itemIndex: number, groupIndex: number) => void;
  showValueField?: boolean;
}> = (props) => {
  return (
    <div style={{ width: "100%" }}>
      <InputRow>
        <InputRowItem width="50%">
          {props.value.id && (
            <input type="hidden" value={props.value.id} readOnly />
          )}

          <Input
            // required
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

        <PermissionSelect
          value={props.value.data.flag || ""}
          onChange={(ev) => {
            props.onChange({
              ...props.value,
              data: {
                ...props.value.data,
                flag: ev.target.value,
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
    </div>
  );
};

const Options: React.FC<{ formik: FormikHookReturn }> = ({ formik }) => {
  return (
    <ModalSectionContent title="Options">
      {formik.values.groupedOptions ? (
        <Box>
          {formik.values.groupedOptions.map((groupedOption, groupIndex) => (
            <Box key={groupIndex} mt={groupIndex === 0 ? 0 : 4}>
              <Box display="flex" pb={1}>
                <InputRow>
                  <Input
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
                    onClick={() => {
                      formik.setFieldValue(
                        `groupedOptions`,
                        remove(groupIndex, 1, formik.values.groupedOptions)
                      );
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Box>
              <Box pl={4}>
                <ListManager
                  values={groupedOption.children}
                  onChange={(newOptions) => {
                    formik.setFieldValue(
                      `groupedOptions[${groupIndex}].children`,
                      newOptions
                    );
                  }}
                  newValue={() =>
                    ({
                      data: {
                        text: "",
                        description: "",
                        val: "",
                        flag: "",
                      },
                    } as ChecklistOption)
                  }
                  newValueLabel="add new option"
                  Editor={OptionEditor}
                  editorExtraProps={{
                    groupIndex,
                    showValueField: !!formik.values.fn,
                    onMoveToGroup: (
                      movedItemIndex: number,
                      moveToGroupIndex: number
                    ) => {
                      const item = groupedOption.children[movedItemIndex];
                      formik.setFieldValue(
                        "groupedOptions",
                        compose(
                          adjust(moveToGroupIndex, (option: Group<Option>) => ({
                            ...option,
                            children: [...option.children, item],
                          })),
                          adjust(groupIndex, (option: Group<Option>) => ({
                            ...option,
                            children: remove(
                              movedItemIndex,
                              1,
                              option.children
                            ),
                          }))
                        )(formik.values.groupedOptions)
                      );
                    },
                    groups: formik.values.groupedOptions.map(
                      (opt) => opt.title
                    ),
                  }}
                />
              </Box>
            </Box>
          ))}
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
                flag: "",
              },
            } as ChecklistOption)
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
      description: props.node?.data?.description || "",
      fn: props.node?.data?.fn || "",
      groupedOptions: props.groupedOptions,
      img: props.node?.data?.img || "",
      options: props.options,
      text: props.node?.data?.text || "",
      ...parseMoreInformation(props.node?.data),
    },
    onSubmit: ({ options, groupedOptions, ...values }) => {
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
          options
            ? options
                .filter((o: ChecklistOption) => o.data.text)
                .map((o) => ({
                  ...o,
                  id: o.id || undefined,
                  type: TYPES.Response,
                }))
            : groupedOptions
            ? groupedOptions
                .flatMap((gr) => gr.children)
                .filter((o: ChecklistOption) => o.data.text)
                .map((o) => ({
                  ...o,
                  id: o.id || undefined,
                  type: TYPES.Response,
                }))
            : []
        );
      } else {
        alert(JSON.stringify({ type, ...values, options }, null, 2));
      }
    },
    validate: () => {},
  });

  const focusRef = useRef(null);

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
          <InputGroup deletable={false}>
            <InputRow>
              <Input
                format="large"
                name="text"
                value={formik.values.text}
                placeholder="Text"
                onChange={formik.handleChange}
                inputRef={focusRef}
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
                // required
                format="data"
                name="fn"
                value={formik.values.fn}
                placeholder="Data Field"
                onChange={formik.handleChange}
              />
            </InputRow>
            <OptionButton
              selected={!!formik.values.groupedOptions}
              onClick={() => {
                formik.setValues({
                  ...formik.values,
                  ...toggleExpandableChecklist({
                    options: formik.values.options,
                    groupedOptions: formik.values.groupedOptions,
                  }),
                });
              }}
            >
              Expandable
            </OptionButton>

            <OptionButton
              selected={formik.values.allRequired}
              onClick={() => {
                formik.setFieldValue("allRequired", !formik.values.allRequired);
              }}
            >
              All required
            </OptionButton>
          </InputGroup>
        </ModalSectionContent>

        <Options formik={formik} />
      </ModalSection>

      <MoreInformation
        changeField={formik.handleChange}
        definitionImg={formik.values.definitionImg}
        howMeasured={formik.values.howMeasured}
        policyRef={formik.values.policyRef}
        info={formik.values.info}
      />
      <InternalNotes
        name="notes"
        onChange={formik.handleChange}
        value={formik.values.notes}
      />
    </form>
  );
};

export default ChecklistComponent;
