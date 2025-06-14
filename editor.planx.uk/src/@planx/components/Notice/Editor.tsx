import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import type { Notice } from "@planx/components/Notice/model";
import { parseNotice } from "@planx/components/Notice/model";
import { useFormik } from "formik";
import React from "react";
import ColorPicker from "ui/editor/ColorPicker/ColorPicker";
import { ComponentTagSelect } from "ui/editor/ComponentTagSelect";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { Switch } from "ui/shared/Switch";

import { InternalNotes } from "../../../ui/editor/InternalNotes";
import { MoreInformation } from "../../../ui/editor/MoreInformation/MoreInformation";
import { ICONS } from "../shared/icons";

export interface Props {
  id?: string;
  handleSubmit?: (data: { type: TYPES.Notice; data: Notice }) => void;
  node?: any;
  disabled?: boolean;
}

export interface NoticeEditorProps {
  value: Notice;
  onChange: (newValue: Notice) => void;
  disabled?: boolean;
}

const NoticeEditor: React.FC<NoticeEditorProps> = (props) => {
  return (
    <>
      <TemplatedNodeInstructions
        isTemplatedNode={props.value.isTemplatedNode}
        templatedNodeInstructions={props.value.templatedNodeInstructions}
        areTemplatedNodeInstructionsRequired={
          props.value.areTemplatedNodeInstructionsRequired
        }
      />
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
              disabled={props.disabled}
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
              disabled={props.disabled}
            />
          </InputRow>
          <ColorPicker
            inline
            label="Background colour"
            color={props.value.color}
            onChange={(color) => {
              props.onChange({
                ...props.value,
                color,
              });
            }}
            disabled={props.disabled}
          />
          <InputRow>
            <Switch
              checked={Boolean(props.value.resetButton)}
              onChange={() =>
                props.onChange({
                  ...props.value,
                  resetButton: !props.value.resetButton,
                })
              }
              label="Reset to start of service"
              disabled={props.disabled}
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
        howMeasured={props.value.howMeasured}
        policyRef={props.value.policyRef}
        info={props.value.info}
        disabled={props.disabled}
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
        disabled={props.disabled}
      />
      <ComponentTagSelect
        onChange={(value) =>
          props.onChange({
            ...props.value,
            tags: value,
          })
        }
        value={props.value.tags}
        disabled={props.disabled}
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
        disabled={props.disabled}
      />
    </form>
  );
};

export default NoticeComponent;
