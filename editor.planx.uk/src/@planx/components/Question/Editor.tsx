import { useFormik } from "formik";
import React, { useEffect, useRef } from "react";
import ImgInput from "ui/editor/ImgInput";
import InputGroup from "ui/editor/InputGroup";
import ListManager from "ui/editor/ListManager";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput";
import Input from "ui/shared/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";

import { Option, parseMoreInformation } from "../shared";
import PermissionSelect from "../shared/PermissionSelect";
import { TYPES } from "../types";
import { ICONS, InternalNotes, MoreInformation } from "../ui";

interface Props {
  node: {
    data?: {
      definitionImg?: string;
      description?: string;
      fn?: string;
      howMeasured?: string;
      img?: string;
      info?: string;
      notes?: string;
      policyRef?: string;
      text?: string;
      type?: string;
    };
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
      <InputRowItem width="100%">
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
              flag: ev.target.value as string,
            },
          });
        }}
        sx={{ width: { md: "160px" }, maxWidth: "160px" }}
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
  </div>
);

export const Question: React.FC<Props> = (props) => {
  const type = TYPES.Statement;

  const formik = useFormik({
    initialValues: {
      description: props.node?.data?.description || "",
      fn: props.node?.data?.fn || "",
      img: props.node?.data?.img || "",
      options: props.options || [],
      text: props.node?.data?.text || "",
      ...parseMoreInformation(props.node?.data),
    },
    onSubmit: ({ options, ...values }) => {
      const children = options
        .filter((o) => o.data.text)
        .map((o) => ({
          id: o.id || undefined,
          type: TYPES.Response,
          data: o.data,
        }));

      if (props.handleSubmit) {
        props.handleSubmit({ type, data: values }, children);
      } else {
        alert(JSON.stringify({ type, ...values, children }, null, 2));
      }
    },
    validate: () => {},
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
                  flag: "",
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
    </form>
  );
};

export default Question;
