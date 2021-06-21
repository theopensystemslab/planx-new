import { useFormik } from "formik";
import React from "react";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";

import { TYPES } from "../types";
import { EditorProps, ICONS } from "../ui";
import type { Send } from "./model";
import { parseContent } from "./model";

export type Props = EditorProps<TYPES.Send, Send>;

const ContentComponent: React.FC<Props> = (props) => {
  const formik = useFormik<Send>({
    initialValues: parseContent(props.node?.data),
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.Send, data: newValues });
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Send" Icon={ICONS[TYPES.Send]} />
      </ModalSection>
    </form>
  );
};

export default ContentComponent;
