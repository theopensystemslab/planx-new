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
import { TYPES, Text } from "../../data/types";
import { nodeIcon } from "../shared";

export interface Props {
  id?: string;
  handleSubmit?: (d: any) => void;
  node?: any;
}

export interface ContentEditorProps {
  value: Text;
  onChange: (newValue: Text) => void;
}

const ContentEditor: React.FC<ContentEditorProps> = (props) => {
  return (
    <>
      <ModalSection>
        <ModalSectionContent title="Content" Icon={nodeIcon(TYPES.Content)}>
          <InputRow>
            <Input
              format="large"
              name="text"
              value={props.value.title}
              placeholder="Text"
              onChange={(ev) => {
                props.onChange({
                  ...props.value,
                  title: ev.target.value,
                });
              }}
            />
            <RichTextInput
              placeholder="Content"
              value={props.value.description}
              onChange={(ev) => {
                props.onChange({
                  ...props.value,
                  description: ev.target.value,
                });
              }}
            />
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
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

const ContentComponent: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: {
      text: {
        // TODO: improve runtime validation here (joi, io-ts)
        title: props.node?.title || "",
        description: props.node?.description || "",
      },
    },
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ $t: TYPES.Text, ...newValues.text });
      }
    },
    validate: () => {},
  });
  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ContentEditor
        value={formik.values.text}
        onChange={(content) => {
          formik.setFieldValue("text", content);
        }}
      />
    </form>
  );
};

export default ContentComponent;
