import React from "react";
import { ReportProblemOutlined } from "@material-ui/icons";
import {
  Input,
  InputRow,
  RichTextInput,
  InternalNotes,
  ModalSection,
  ModalSectionContent,
  ColorPicker,
} from "../../../../ui";
import { useFormik } from "formik";
import { Notice, TYPES } from "../../data/types";

export interface Props {
  id?: string;
  handleSubmit?: (d: any) => void;
  node?: any;
}

export interface NoticeEditorProps {
  value: Notice;
  onChange: (newValue: Notice) => void;
}

const NoticeEditor: React.FC<NoticeEditorProps> = (props) => {
  return (
    <>
      <ModalSection>
        <ModalSectionContent title="Notice" Icon={ReportProblemOutlined}>
          <InputRow>
            <Input
              format="large"
              placeholder="Notice"
              value={props.value.title}
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
          <div>
            <span>Color: </span>
            <ColorPicker
              inline
              color={props.value.color}
              onChange={(color) => {
                props.onChange({
                  ...props.value,
                  color,
                });
              }}
            />
          </div>
          <input
            type="checkbox"
            checked={!!props.value.resetButton}
            onChange={() => {
              props.onChange({
                ...props.value,
                resetButton: !props.value.resetButton,
              });
            }}
          />
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

const NoticeComponent: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: {
      notice: {
        // TODO: improve runtime validation here (joi, io-ts)
        title: props.node?.title || "",
        description: props.node?.description || "",
        color: props.node?.color || "",
        notes: props.node?.notes || "",
        resetButton: props.node?.resetButton || false,
      },
    },
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ $t: TYPES.Notice, ...newValues.notice });
      }
    },
    validate: () => {},
  });
  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <NoticeEditor
        value={formik.values.notice}
        onChange={(notice) => {
          formik.setFieldValue("notice", notice);
        }}
      />
    </form>
  );
};

export default NoticeComponent;
