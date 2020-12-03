import { useFormik } from "formik";
import React from "react";
import Input from "ui/Input";
import InputRow from "ui/InputRow";
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
    validate: () => {},
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Send" Icon={ICONS[TYPES.Send]}>
          <InputRow>
            <Input
              required
              type="url"
              placeholder="url"
              name="url"
              value={formik.values.url}
              onChange={formik.handleChange}
            />
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
    </form>
  );
};

export default ContentComponent;
