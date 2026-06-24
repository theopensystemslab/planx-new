import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { useFormikWithRef } from "@planx/components/shared/useFormikWithRef";
import React from "react";
import ModalSection from "ui/editor/ModalSection";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import { EditorProps } from "../shared/types";
import { parseStickyNote, StickyNote, validationSchema } from "./model";

export type Props = EditorProps<TYPES.Question, StickyNote>;

const StickyNoteEditor: React.FC<Props> = (props) => {
  const formik = useFormikWithRef<StickyNote>(
    {
      initialValues: parseStickyNote(props.node?.data),
      onSubmit: (newValues) => {
        if (props.handleSubmit) {
          props.handleSubmit({ type: TYPES.Question, data: newValues });
        }
      },
      validationSchema,
    },
    props.formikRef,
  );

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <InputRow>
          <Input
            name="text"
            format="large"
            placeholder="Note title"
            value={formik.values.text}
            onChange={formik.handleChange}
            disabled={props.disabled}
            errorMessage={formik.errors.text}
          />
        </InputRow>
      </ModalSection>
    </form>
  );
};

export default StickyNoteEditor;
