import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { EditorProps, ICONS } from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import InputGroup from "ui/editor/InputGroup";
import InputLabel from "ui/editor/InputLabel";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import {
  descriptionPlaceholder,
  disclaimerPlaceholder,
  freeformQuestionPlaceholder,
  ratingQuestionPlaceholder,
} from "../components/placeholders";
import { Feedback, parseFeedback } from "../model";
type Props = EditorProps<TYPES.Feedback, Feedback>;
export const FeedbackEditor = (props: Props) => {
  const formik = useFormik({
    initialValues: parseFeedback(props.node?.data),
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.Feedback,
        data: newValues,
      });
    },
  });
  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Feedback" Icon={ICONS[TYPES.Feedback]}>
          <InputGroup flowSpacing>
            <InputRow>
              <InputLabel label="Title">
                <Input
                  format="large"
                  placeholder="Tell us what you think"
                  value={undefined}
                  onChange={formik.handleChange}
                />
              </InputLabel>
            </InputRow>
            <InputRow>
              <InputLabel label="Description">
                <RichTextInput
                  name="description"
                  value={formik.values.description || descriptionPlaceholder}
                  placeholder="Description"
                  onChange={formik.handleChange}
                />
              </InputLabel>
            </InputRow>

            <InputRow>
              <InputLabel label="Rating question">
                <RichTextInput
                  placeholder={ratingQuestionPlaceholder}
                  name="rating-question"
                  value={formik.values.ratingQuestion}
                  onChange={formik.handleChange}
                />
              </InputLabel>
            </InputRow>
            <InputRow>
              <InputLabel label="Freeform question">
                <RichTextInput
                  placeholder={freeformQuestionPlaceholder}
                  name="freeform-question"
                  value={formik.values.freeformQuestion}
                  onChange={formik.handleChange}
                />
              </InputLabel>
            </InputRow>
            <InputRow>
              <InputLabel label="Disclaimer text">
                <RichTextInput
                  name="disclaimer"
                  value={formik.values.disclaimer || disclaimerPlaceholder}
                  placeholder={disclaimerPlaceholder}
                  onChange={formik.handleChange}
                />
              </InputLabel>
            </InputRow>
            <InputRow>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.feedbackRequired}
                    onChange={() =>
                      formik.setFieldValue(
                        "feedbackRequired",
                        !formik.values.feedbackRequired,
                      )
                    }
                  />
                }
                label="Feedback required"
              />
            </InputRow>
          </InputGroup>
        </ModalSectionContent>
      </ModalSection>
    </form>
  );
};
