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
import {
  Checklist,
  Option,
  toggleExpandableChecklist,
  TYPES,
} from "../../data/types";
import { ICONS } from "../shared";
import { MoreInformation, PermissionSelect } from "./shared";

interface ChecklistProps extends Checklist {
  handleSubmit?: Function;
  node?: any;
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
          value={props.value.text || ""}
          onChange={(ev) => {
            props.onChange({
              ...props.value,
              text: ev.target.value,
            });
          }}
          placeholder="Option"
        />
      </InputRowItem>

      <ImgInput
        img={props.value.img}
        onChange={(img) => {
          props.onChange({
            ...props.value,
            img,
          });
        }}
      />

      <PermissionSelect
        value={props.value.flag || ""}
        onChange={(ev) => {
          props.onChange({
            ...props.value,
            flag: ev.target.value,
          });
        }}
      />
    </InputRow>

    {props.showValueField && (
      <InputRow>
        <Input
          format="data"
          value={props.value.val || ""}
          placeholder="Data Value"
          onChange={(ev) => {
            props.onChange({
              ...props.value,
              val: ev.target.value,
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
                  disableDragAndDrop
                  newValue={() =>
                    ({
                      text: "",
                      description: "",
                      val: "",
                      flag: "",
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
          disableDragAndDrop
          newValueLabel="add new option"
          newValue={() =>
            ({
              text: "",
              description: "",
              val: "",
              flag: "",
            } as Option)
          }
          Editor={OptionEditor}
          editorExtraProps={{ showValueField: !!formik.values.fn }}
        />
      )}
    </ModalSectionContent>
  );
};

export const ChecklistComponent: React.FC<ChecklistProps> = ({
  fn = "",
  howMeasured = "",
  description = "",
  text = "",
  notes = "",
  policyRef = "",
  info = "",
  options,
  groupedOptions,
  handleSubmit,
  img = "",
  definitionImg = "",
  allRequired = false,
}) => {
  const $t = TYPES.Checklist;

  const formik = useFormik<Checklist>({
    initialValues: {
      info,
      policyRef,
      howMeasured,
      notes,
      text,
      description,
      fn,
      options,
      groupedOptions,
      img,
      definitionImg,
      allRequired,
    },
    onSubmit: ({ options, groupedOptions, ...values }) => {
      if (handleSubmit) {
        handleSubmit(
          {
            type: $t,
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
                .filter((o) => o.text)
                .map((o) => ({ ...o, $t: TYPES.Response }))
            : groupedOptions
            ? groupedOptions
                .flatMap((gr) => gr.children)
                .filter((o) => o.text)
                .map((o) => ({ ...o, $t: TYPES.Response }))
            : []
        );
      } else {
        alert(JSON.stringify({ $t, ...values, options }, null, 2));
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
        <ModalSectionContent title="Checklist" Icon={ICONS[$t]}>
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
