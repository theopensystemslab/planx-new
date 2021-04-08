import { useFormik } from "formik";
import React from "react";
import Input from "ui/Input";
import InputRow from "ui/InputRow";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";
import RichTextInput from "ui/RichTextInput";

import { TYPES } from "../types";
import { ICONS, InternalNotes } from "../ui";
import type { Review } from "./model";

interface Props {
  id?: string;
  handleSubmit?: (data: { type: TYPES.Review; data: Review }) => void;
  node?: any;
}

function Component(props: Props) {
  const formik = useFormik<Review>({
    initialValues: {
      title: props.node?.data?.title ?? "",
      description: props.node?.data?.description ?? "",
      notes: props.node?.data?.notes ?? "",
    },
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.Review, data: newValues });
      }
    },
    validate: () => {},
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Review" Icon={ICONS[TYPES.Review]}>
          <InputRow>
            <Input
              format="large"
              placeholder="Review"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              placeholder="Description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
      <InternalNotes
        name="notes"
        onChange={formik.handleChange}
        value={formik.values.notes}
      />
    </form>
  );
}

export default Component;
