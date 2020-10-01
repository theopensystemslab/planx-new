import { CallSplit } from "@material-ui/icons";
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
  MoreInformation,
  RichTextInput,
} from "../../../../ui";
import { TYPES } from "../../data/types";
import { PermissionSelect } from "./shared";

interface Option {
  val?: string;
  description?: string;
  id?: string;
  flag?: string;
  text?: string;
  img?: string;
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
      <ListManager
        values={formik.values.options}
        onChange={(newOptions) => {
          formik.setFieldValue("options", newOptions);
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
  const $t = TYPES.Statement;

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
      if (handleSubmit) {
        handleSubmit(
          { $t, ...values },
          options
            .filter((o) => o.text)
            .map((o) => ({ ...o, $t: TYPES.Response }))
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
        <ModalSectionContent title="Question" Icon={CallSplit}>
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
        definitionImg={formik.values.definitionImg}
        definitionName="howMeasured"
        definitionValue={formik.values.howMeasured}
        formik={formik}
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

export default Question;
