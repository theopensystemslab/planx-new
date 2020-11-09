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
      notice: {
        // TODO: improve runtime validation here (joi, io-ts)
        title: props.node?.data?.title || "",
        description: props.node?.data?.description || "",
        color: props.node?.data?.color || "#EFEFEF",
        notes: props.node?.data?.notes || "",
        resetButton: props.node?.data?.resetButton || false,
        definitionImg: props.node?.data?.definitionImg,
        howMeasured: props.node?.data?.howMeasured,
        policyRef: props.node?.data?.policyRef,
        info: props.node?.data?.info,
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
