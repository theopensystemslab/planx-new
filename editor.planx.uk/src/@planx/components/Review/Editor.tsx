import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import { ICONS } from "../shared/icons";
import { EditorProps } from "../shared/types";
import { parseContent, Review } from "./model";

type Props = EditorProps<TYPES.Review, Review>;

function Component(props: Props) {
  const formik = useFormik<Review>({
    initialValues: parseContent(props.node?.data),
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.Review,
        data: newValues,
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Review" Icon={ICONS[TYPES.Review]}>
          <InputRow>
            <Input
              format="large"
              name="title"
              placeholder={formik.values.title}
              value={formik.values.title}
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              name="description"
              placeholder="Description"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} showMoreInformation={false} />
    </form>
  );
}

export default Component;
