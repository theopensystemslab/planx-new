import { useFormik } from "formik";
import React from "react";

import {
  Input,
  InputRow,
  InternalNotes,
  ModalSection,
  ModalSectionContent,
  RichTextInput,
} from "../../../../ui";
import { TYPES, TextInput } from "../../data/types";
import { ICONS } from "../shared";
import { MoreInformation } from "./shared";

export interface Props {
  id?: string;
  handleSubmit?: (d: any) => void;
  node?: any;
}

export interface TextInputEditorProps {
  value: TextInput;
  onChange: (newValue: TextInput) => void;
}

const TextInputEditor: React.FC<TextInputEditorProps> = (props) => {
  return (
    <>
      <ModalSection>
        <ModalSectionContent title="Text Input" Icon={ICONS[TYPES.TextInput]}>
          <InputRow>
            <Input
              format="large"
              name="text"
              value={props.value.title}
              placeholder="Title"
              onChange={(ev) => {
                props.onChange({
                  ...props.value,
                  title: ev.target.value,
                });
              }}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              placeholder="Description"
              value={props.value.description}
              onChange={(ev) => {
                props.onChange({
                  ...props.value,
                  description: ev.target.value,
                });
              }}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              placeholder="Placeholder"
              value={props.value.placeholder}
              onChange={(ev) => {
                props.onChange({
                  ...props.value,
                  placeholder: ev.target.value,
                });
              }}
            />
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
      <MoreInformation
        changeField={(ev: any) => {
          props.onChange({
            ...props.value,
            [ev.target.name]: ev.target.value,
          });
        }}
        definitionImg={props.value.definitionImg}
        definitionName="howMeasured"
        definitionValue={props.value.howMeasured}
        policyName="policyRef"
        policyValue={props.value.policyRef}
        whyName="info"
        whyValue={props.value.info}
      />
      <InternalNotes
        name="notes"
        onChange={(ev) => {
          props.onChange({
            ...props.value,
            notes: ev.target.value,
          });
        }}
        value={props.value.notes}
      />
    </>
  );
};

const TextInputComponent: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: {
      text: {
        // TODO: improve runtime validation here (joi, io-ts)
        title: props.node?.title || "",
        description: props.node?.description || "",
        placeholder: props.node?.placeholder || "",
        definitionImg: props.node?.definitionImg,
        howMeasured: props.node?.howMeasured,
        policyRef: props.node?.policyRef,
        info: props.node?.info,
      },
    },
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ $t: TYPES.TextInput, ...newValues.text });
      }
    },
    validate: () => {},
  });
  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <TextInputEditor
        value={formik.values.text}
        onChange={(content) => {
          formik.setFieldValue("text", content);
        }}
      />
    </form>
  );
};

export default TextInputComponent;
