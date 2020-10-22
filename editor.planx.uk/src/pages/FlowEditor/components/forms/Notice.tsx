import { useFormik } from "formik";
import React from "react";
import {
  ColorPicker,
  Input,
  InputRow,
  InternalNotes,
  ModalSection,
  ModalSectionContent,
  OptionButton,
  RichTextInput,
} from "../../../../ui";
import { Notice, TYPES } from "../../data/types";
import { ICONS } from "../shared";
import { MoreInformation } from "./shared";

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

const NoticeComponent: React.FC<Props> = (props) => {
  const formik = useFormik<{ notice: Notice }>({
    initialValues: {
      notice: {
        // TODO: improve runtime validation here (joi, io-ts)
        title: props.node?.title || "",
        description: props.node?.description || "",
        color: props.node?.color || "#EFEFEF",
        notes: props.node?.notes || "",
        resetButton: props.node?.resetButton || false,
        definitionImg: props.node?.definitionImg,
        howMeasured: props.node?.howMeasured,
        policyRef: props.node?.policyRef,
        info: props.node?.info,
      },
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
