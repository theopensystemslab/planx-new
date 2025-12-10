import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { useFormikWithRef } from "@planx/components/shared/useFormikWithRef";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import { ICONS } from "../shared/icons";
import { EditorProps } from "../shared/types";
import { parseContent, Review, validationSchema } from "./model";

type Props = EditorProps<TYPES.Review, Review>;

function Component(props: Props) {
  const formik = useFormikWithRef<Review>(
    {
      initialValues: parseContent(props.node?.data),
      onSubmit: (newValues) => {
        props.handleSubmit?.({
          type: TYPES.Review,
          data: newValues,
        });
      },
      validationSchema,
    },
    props.formikRef,
  );

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <TemplatedNodeInstructions
        isTemplatedNode={formik.values.isTemplatedNode}
        templatedNodeInstructions={formik.values.templatedNodeInstructions}
        areTemplatedNodeInstructionsRequired={
          formik.values.areTemplatedNodeInstructionsRequired
        }
      />
      <ModalSection>
        <ModalSectionContent title="Review" Icon={ICONS[TYPES.Review]}>
          <InputRow>
            <Input
              format="large"
              name="title"
              placeholder={formik.values.title}
              value={formik.values.title}
              onChange={formik.handleChange}
              disabled={props.disabled}
              errorMessage={formik.errors.title}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              name="description"
              placeholder="Description"
              value={formik.values.description}
              onChange={formik.handleChange}
              disabled={props.disabled}
              errorMessage={formik.errors.description}
            />
          </InputRow>
        </ModalSectionContent>
        <ModalSectionContent subtitle="Disclaimer">
          <InputRow>
            <RichTextInput
              name="disclaimer"
              placeholder="Disclaimer"
              value={formik.values.disclaimer}
              onChange={formik.handleChange}
              disabled={props.disabled}
              errorMessage={formik.errors.disclaimer}
            />
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter
        formik={formik}
        showMoreInformation={false}
        disabled={props.disabled}
      />
    </form>
  );
}

export default Component;
