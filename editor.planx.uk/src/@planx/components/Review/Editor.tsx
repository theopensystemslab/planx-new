import { flowHasReview } from "api/flowHasReview";
import WarningMessages from "components/ErrorsWarning";
import { FormikErrors, useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import Input from "ui/Input";
import InputRow from "ui/InputRow";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";
import RichTextInput from "ui/RichTextInput";

import { TYPES } from "../types";
import { EditorProps, ICONS, InternalNotes } from "../ui";
import { parseContent, Review } from "./model";

type Props = EditorProps<TYPES.Review, Review>;
type Errors = FormikErrors<Review>;

function Component(props: Props) {
  const formik = useFormik<Review>({
    initialValues: parseContent(props.node?.data),
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.Review,
        data: newValues,
      });
    },
    validate,
    validateOnChange: false,
    validateOnMount: true,
  });

  const [flowId] = useStore((state) => [state.id]);

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      {Boolean(formik.errors?.title) && (
        <WarningMessages errors={Object.values(formik.errors)} />
      )}
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
      <InternalNotes
        name="notes"
        onChange={formik.handleChange}
        value={formik.values.notes}
      />
    </form>
  );

  async function validate(): Promise<Errors> {
    const errors: Errors = {};

    const res = await flowHasReview(flowId, props.id);

    if (res.hasReview) {
      const message = {
        child: `The portal ${res.slug} has a review component. Remove the existing review component before adding a new one.`,
        parent: `The flow ${res.slug} contains a review component and is using this flow or portals present in this flow as portals. Remove the existing review component before adding a new one.`,
        current:
          "There is a review component in this flow. Remove the existing review component before adding a new one.",
      };
      errors.title = message[res.placement] || "";
    }

    if (props.setIsValid) props.setIsValid(!errors.title);

    return errors;
  }
}

export default Component;
