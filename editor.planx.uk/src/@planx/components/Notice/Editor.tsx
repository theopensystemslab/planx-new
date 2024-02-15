import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import type { Notice } from "@planx/components/Notice/model";
import { parseNotice } from "@planx/components/Notice/model";
import { ICONS, InternalNotes, MoreInformation } from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import ColorPicker from "ui/editor/ColorPicker";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import OptionButton from "ui/editor/OptionButton";
import RichTextInput from "ui/editor/RichTextInput";
import Input from "ui/shared/Input";
import InputRow from "ui/shared/InputRow";

export interface Props {
  id?: string;
  handleSubmit?: (data: { type: TYPES.Notice; data: Notice }) => void;
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
        <ModalSectionContent title="Notice" Icon={ICONS[TYPES.Notice]}>
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
          <OptionButton
            selected={Boolean(props.value.resetButton)}
            onClick={() => {
              props.onChange({
                ...props.value,
                resetButton: !props.value.resetButton,
              });
            }}
          >
            Reset
          </OptionButton>
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
        howMeasured={props.value.howMeasured}
        policyRef={props.value.policyRef}
        info={props.value.info}
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

const NoticeComponent: React.FC<Props> = (props) => {
  const formik = useFormik<{ notice: Notice }>({
    initialValues: {
      notice: parseNotice(props.node?.data),
    },
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.Notice, data: newValues.notice });
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
