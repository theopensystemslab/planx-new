import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { FormikErrors, FormikValues, useFormik } from "formik";
import React, { useEffect, useRef } from "react";
import { ComponentTagSelect } from "ui/editor/ComponentTagSelect";
import ImgInput from "ui/editor/ImgInput/ImgInput";
import InputGroup from "ui/editor/InputGroup";
import ListManager from "ui/editor/ListManager/ListManager";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import { Switch } from "ui/shared/Switch";

import { InternalNotes } from "../../../ui/editor/InternalNotes";
import { MoreInformation } from "../../../ui/editor/MoreInformation/MoreInformation";
import { BaseNodeData, Option, parseBaseNodeData } from "../shared";
import { FlagsSelect } from "../shared/FlagsSelect";
import { ICONS } from "../shared/icons";

interface Props {
  node: {
    data?: {
      description?: string;
      fn?: string;
      img?: string;
      text: string;
      type?: string;
      neverAutoAnswer?: boolean;
    } & BaseNodeData;
  };
  options?: Option[];
  handleSubmit?: Function;
}

const OptionEditor: React.FC<{
  value: Option;
  onChange: (newVal: Option) => void;
  showValueField?: boolean;
}> = (props) => (
  <div style={{ width: "100%" }}>
    <InputRow>
      {props.value.id && (
        <input type="hidden" value={props.value.id} readOnly />
      )}
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
    </InputRow>
    <InputRow>
      <Input
        value={props.value.data.description || ""}
        placeholder="Description"
        onChange={(ev) => {
          props.onChange({
            ...props.value,
            data: {
              ...props.value.data,
              description: ev.target.value,
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
    <FlagsSelect
      value={
        Array.isArray(props.value.data.flag)
          ? props.value.data.flag
          : [props.value.data.flag]
      }
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

export const Question: React.FC<Props> = (props) => {
  const type = TYPES.Question;

  const formik = useFormik({
    initialValues: {
      description: props.node?.data?.description || "",
      fn: props.node?.data?.fn || "",
      img: props.node?.data?.img || "",
      options: props.options || [],
      text: props.node?.data?.text || "",
      neverAutoAnswer: props.node?.data?.neverAutoAnswer || false,
      ...parseBaseNodeData(props.node?.data),
    },
    onSubmit: ({ options, ...values }) => {
      const children = options
        .filter((o) => o.data.text)
        .map((o) => ({
          id: o.id || undefined,
          type: TYPES.Answer,
          data: o.data,
        }));

      if (props.handleSubmit) {
        props.handleSubmit({ type, data: values }, children);
      } else {
        alert(JSON.stringify({ type, ...values, children }, null, 2));
      }
    },
    validate: ({ options, ...values }) => {
      const errors: FormikErrors<FormikValues> = {};
      if (values.fn && !options.some((option) => option.data.val)) {
        errors.fn =
          "At least one option must set a data value when the question has a data field";
      }
      return errors;
    },
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
        <ModalSectionContent title="Question" Icon={ICONS[type]}>
          <InputGroup>
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
                error={Boolean(formik.errors?.fn)}
                errorMessage={formik.errors?.fn}
              />
            </InputRow>
            <InputRow>
              <Switch
                checked={formik.values.neverAutoAnswer}
                onChange={() =>
                  formik.setFieldValue(
                    "neverAutoAnswer",
                    !formik.values.neverAutoAnswer,
                  )
                }
                label="Always put to user (forgo automation)"
              />
            </InputRow>
          </InputGroup>
        </ModalSectionContent>
        <ModalSectionContent subtitle="Options">
          <ListManager
            values={formik.values.options}
            onChange={(newOptions) => {
              formik.setFieldValue("options", newOptions);
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
            Editor={OptionEditor}
            editorExtraProps={{ showValueField: !!formik.values.fn }}
          />
        </ModalSectionContent>
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
      <ComponentTagSelect
        value={formik.values.tags}
        onChange={(value) => formik.setFieldValue("tags", value)}
      />
    </form>
  );
};

export default Question;
