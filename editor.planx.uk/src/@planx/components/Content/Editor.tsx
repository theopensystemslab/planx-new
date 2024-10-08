import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import type { Content } from "@planx/components/Content/model";
import { parseContent } from "@planx/components/Content/model";
import {
  EditorProps,
  ICONS,
} from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import ColorPicker from "ui/editor/ColorPicker";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput";
import InputRow from "ui/shared/InputRow";

export type Props = EditorProps<TYPES.Content, Content>;

const ContentComponent: React.FC<Props> = (props) => {
  const formik = useFormik<Content>({
    initialValues: parseContent(props.node?.data),
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.Content, data: newValues });
      }
    },
    validate: () => {},
  });
  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Content" Icon={ICONS[TYPES.Content]}>
          <InputRow>
            <RichTextInput
              placeholder="Content"
              name="content"
              value={formik.values.content}
              onChange={formik.handleChange}
            />
          </InputRow>
          <ColorPicker
            inline
            label="Background colour"
            color={formik.values.color}
            onChange={(color) => {
              formik.setFieldValue("color", color);
            }}
          />
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} />
    </form>
  );
};

export default ContentComponent;
