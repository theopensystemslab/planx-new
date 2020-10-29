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
  RichTextInput,
} from "../../../../ui";
import { TYPES } from "../../data/types";
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

interface Props {
  fn?: string;
  howMeasured?: string;
  description?: string;
  handleClose?: Function;
  handleSubmit?: Function;
  notes?: string;
  options?: Option[];
  policyRef?: string;
  text?: string;
  type?: string;
  info?: string;
  img?: string;
  definitionImg?: string;
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
          } as Option)
        }
        Editor={OptionEditor}
        editorExtraProps={{ showValueField: !!formik.values.fn }}
      />
    </ModalSectionContent>
  );
};

export const Question: React.FC<Props> = ({
  fn = "",
  howMeasured = "",
  description = "",
  text = "",
  notes = "",
  policyRef = "",
  info = "",
  options = [],
  handleSubmit,
  img = "",
  definitionImg = "",
}) => {
  const type = TYPES.Statement;

  const formik = useFormik({
    initialValues: {
      info,
      policyRef,
      howMeasured,
      notes,
      text,
      description,
      fn,
      options,
      img,
      definitionImg,
    },
    onSubmit: ({ options, ...values }) => {
      const children = options
        .filter((o) => o.data.text)
        .map((o) => ({
          id: o.id || undefined,
          type: TYPES.Response,
          data: o.data,
        }));

      if (handleSubmit) {
        handleSubmit({ type, data: values }, children);
      } else {
        alert(JSON.stringify({ type, ...values, children }, null, 2));
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
        <ModalSectionContent title="Question" Icon={ICONS[type]}>
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
          </InputGroup>
        </ModalSectionContent>

        <Options formik={formik} />
      </ModalSection>

      <MoreInformation
        changeField={formik.handleChange}
        whyName="info"
        whyValue={formik.values.info}
        policyName="policyRef"
        policyValue={formik.values.policyRef}
        definitionImg={formik.values.definitionImg}
        definitionName="howMeasured"
        definitionValue={formik.values.howMeasured}
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
