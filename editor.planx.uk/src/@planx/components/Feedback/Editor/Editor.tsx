import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { ICONS } from "@planx/components/shared/icons";
import { EditorProps } from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import { Feedback, parseFeedback } from "../model";
type Props = EditorProps<TYPES.SetValue, Feedback>; // TODO: use Feedback type
export const FeedbackEditor = (props: Props) => {
  const formik = useFormik({
    initialValues: parseFeedback(props.node?.data),
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.SetValue, // TODO: use Feedback
        data: newValues,
      });
    },
  });
  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Feedback" Icon={ICONS[TYPES.Notice]}>
          <InputRow>
            <Input
              format="large"
              placeholder="Feedback"
              value={undefined}
              onChange={() => {
                console.log("change!");
              }}
            />
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
    </form>
  );
};