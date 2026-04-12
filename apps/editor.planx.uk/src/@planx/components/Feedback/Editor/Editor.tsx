import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { ICONS } from "@planx/components/shared/icons";
import { EditorProps } from "@planx/components/shared/types";
import { useFormikWithRef } from "@planx/components/shared/useFormikWithRef";
import React from "react";
import InputGroup from "ui/editor/InputGroup";
import InputLabel from "ui/editor/InputLabel";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { Switch } from "ui/shared/Switch";

import { defaultContent } from "../components/defaultContent";
import { Feedback, parseFeedback, validationSchema } from "../model";

type FeedbackEditorProps = EditorProps<TYPES.Feedback, Feedback>;

export const FeedbackEditor = (props: FeedbackEditorProps) => {
  const formik = useFormikWithRef<Feedback>(
    {
      initialValues: parseFeedback(props.node?.data),
      onSubmit: (newValues) => {
        if (props.handleSubmit) {
          props.handleSubmit({
            type: TYPES.Feedback,
            data: newValues,
          });
        }
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
        <ModalSectionContent title="Feedback" Icon={ICONS[TYPES.Feedback]}>
          <InputGroup flowSpacing>
            <InputRow>
              <InputLabel label="Title">
                <Input
                  format="large"
                  placeholder={defaultContent.title}
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  disabled={props.disabled}
                  errorMessage={formik.errors.title}
                />
              </InputLabel>
            </InputRow>
            <InputRow>
              <InputLabel label="Description" htmlFor="description">
                <RichTextInput
                  name="description"
                  id="description"
                  value={formik.values.description}
                  placeholder="Description"
                  onChange={formik.handleChange}
                  disabled={props.disabled}
                  errorMessage={formik.errors.description}
                />
              </InputLabel>
            </InputRow>

            <InputRow>
              <InputLabel label="Rating question" htmlFor="ratingQuestion">
                <Input
                  value={formik.values.ratingQuestion}
                  onChange={formik.handleChange}
                  disabled
                />
              </InputLabel>
            </InputRow>
            <InputRow>
              <InputLabel label="Freeform question" htmlFor="freeformQuestion">
                <Input
                  value={formik.values.freeformQuestion}
                  onChange={formik.handleChange}
                  disabled
                />
              </InputLabel>
            </InputRow>
            <InputRow>
              <InputLabel label="Disclaimer text" htmlFor="disclaimer">
                <RichTextInput
                  value={formik.values.disclaimer}
                  onChange={formik.handleChange}
                  disabled
                  errorMessage={formik.errors.disclaimer}
                />
              </InputLabel>
            </InputRow>
            <InputRow>
              <Switch
                checked={formik.values.feedbackRequired}
                onChange={() =>
                  formik.setFieldValue(
                    "feedbackRequired",
                    !formik.values.feedbackRequired,
                  )
                }
                label="Feedback required"
                disabled={props.disabled}
              />
            </InputRow>
          </InputGroup>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} disabled={props.disabled} />
    </form>
  );
};
