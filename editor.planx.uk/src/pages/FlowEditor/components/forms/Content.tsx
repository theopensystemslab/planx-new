import { useFormik } from "formik";
import React from "react";
import {
  InputRow,
  InternalNotes,
  ModalSection,
  ModalSectionContent,
  RichTextInput,
} from "../../../../ui";
import { Content, TYPES } from "../../data/types";
import { ICONS } from "../shared";

export interface Props {
  id?: string;
  handleSubmit?: (d: any) => void;
  node?: any;
}

export interface ContentEditorProps {
  value: Content;
  onChange: (newValue: Content) => void;
}

const ContentEditor: React.FC<ContentEditorProps> = (props) => {
  return (
    <>
      <ModalSection>
        <ModalSectionContent title="Content" Icon={ICONS[TYPES.Content]}>
          <InputRow>
            <RichTextInput
              placeholder="Content"
              value={props.value.content}
              onChange={(ev) => {
                props.onChange({
                  ...props.value,
                  content: ev.target.value,
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
      content: {
        // TODO: improve runtime validation here (joi, io-ts)
        content: props.node?.content || "",
      },
    },
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.Content, data: newValues.content });
      }
    },
    validate: () => {},
  });
  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ContentEditor
        value={formik.values.content}
        onChange={(content) => {
          formik.setFieldValue("content", content);
        }}
      />
    </form>
  );
};

export default ContentComponent;
