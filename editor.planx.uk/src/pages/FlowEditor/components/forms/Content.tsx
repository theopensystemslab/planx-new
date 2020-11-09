import { useFormik } from "formik";
import React from "react";

import {
  InputRow,
  InternalNotes,
  ModalSection,
  ModalSectionContent,
  RichTextInput,
} from "../../../../ui";
import { Content, TYPES } from "../../data/types";
import { ICONS } from "../shared";

export interface Props {
  id?: string;
  handleSubmit?: (d: any) => void;
  node?: any;
}

const ContentComponent: React.FC<Props> = (props) => {
  const formik = useFormik<Content>({
    initialValues: {
      // TODO: improve runtime validation here (joi, io-ts)
      content: props.node?.data?.content || "",
      notes: props.node?.data?.notes || "",
      policyRef: props.node?.data?.policyRef || "",
      howMeasured: props.node?.data?.howMeasured || "",
      info: props.node?.data?.info || "",
      definitionImg: props.node?.data?.definitionImg || "",
    },
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
        </ModalSectionContent>
      </ModalSection>
      <InternalNotes
        name="notes"
        value={formik.values.notes}
        onChange={formik.handleChange}
      />
    </form>
  );
};

export default ContentComponent;
