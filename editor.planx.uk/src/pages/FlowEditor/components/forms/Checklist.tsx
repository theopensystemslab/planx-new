import { Box, Button, IconButton } from "@material-ui/core";
import { Delete } from "@material-ui/icons";
import { useFormik } from "formik";
import React, { useEffect, useRef } from "react";

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
} from "../../../../ui";
import { removeAt } from "../../../../utils";
import { Checklist, toggleExpandableChecklist, TYPES } from "../../data/types";
import { ICONS } from "../shared";
import { MoreInformation, PermissionSelect } from "./shared";

interface Option {
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
  groupedOptions?: any;
  options?: any;
}

const OptionEditor: React.FC<{
  value: Option;
  onChange: (newVal: Option) => void;
  showValueField?: boolean;
}> = (props) => (
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

const Options: React.FC<{ formik: FormikHookReturn }> = ({ formik }) => {
  return (
    <ModalSectionContent title="Options">
      {formik.values.groupedOptions ? (
        <Box>
          {formik.values.groupedOptions.map((groupedOption, index) => (
            <Box key={index} mt={index === 0 ? 0 : 4}>
              <Box display="flex" pb={1}>
                <InputRow>
                  <Input
                    format="bold"
                    name={`groupedOptions[${index}].title`}
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
                        removeAt(index, formik.values.groupedOptions)
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
                      `groupedOptions[${index}].children`,
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
                    } as Option)
                  }
                  newValueLabel="add new option"
                  Editor={OptionEditor}
                  editorExtraProps={{ showValueField: !!formik.values.fn }}
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
            } as Option)
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
      definitionImg: props.node?.data?.definitionImg || "",
      description: props.node?.data?.description || "",
      fn: props.node?.data?.fn || "",
      groupedOptions: props.groupedOptions,
      howMeasured: props.node?.data?.howMeasured || "",
      img: props.node?.data?.img || "",
      info: props.node?.data?.info || "",
      notes: props.node?.data?.notes || "",
      options: props.options,
      policyRef: props.node?.data?.policyRef || "",
      text: props.node?.data?.text || "",
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
          {
            affectChildren: true,
            children: options
              ? options
                  .filter((o: Option) => o.data.text)
                  .map((o) => ({
                    ...o,
                    id: o.id || undefined,
                    type: TYPES.Response,
                  }))
              : groupedOptions
              ? groupedOptions
                  .flatMap((gr) => gr.children)
                  .filter((o: Option) => o.data.text)
                  .map((o) => ({
                    ...o,
                    id: o.id || undefined,
                    type: TYPES.Response,
                  }))
              : [],
          }
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
        definitionName="howMeasured"
        definitionValue={formik.values.howMeasured}
        policyName="policyRef"
        policyValue={formik.values.policyRef}
        whyName="info"
        whyValue={formik.values.info}
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
