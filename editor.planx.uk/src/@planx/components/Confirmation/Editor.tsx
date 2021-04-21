import Box from "@material-ui/core/Box";
import { EditorProps, ICONS } from "@planx/components/ui";
import { useFormik } from "formik";
import React, { ChangeEvent } from "react";
import Input from "ui/Input";
import InputRow from "ui/InputRow";
import ListManager, {
  EditorProps as ListManagerEditorProps,
} from "ui/ListManager";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";
import RichTextInput from "ui/RichTextInput";

import { TYPES } from "../types";
import { Confirmation, parseNextSteps, Step } from "./model";

export type Props = EditorProps<TYPES.Confirmation, Confirmation>;

function StepEditor(props: ListManagerEditorProps<Step>) {
  return (
    <Box>
      <InputRow>
        <Input
          autoFocus
          required
          name="title"
          value={props.value.title}
          onChange={(ev: ChangeEvent<HTMLInputElement>) => {
            props.onChange({
              ...props.value,
              title: ev.target.value,
            });
          }}
          placeholder="Title"
        />
      </InputRow>
      <InputRow>
        <Input
          required
          name="description"
          value={props.value.description}
          onChange={(ev: ChangeEvent<HTMLInputElement>) => {
            props.onChange({
              ...props.value,
              description: ev.target.value,
            });
          }}
          placeholder="Description"
        />
      </InputRow>
    </Box>
  );
}

export default function ConfirmationEditor(props: Props) {
  const type = TYPES.Confirmation;
  const formik = useFormik({
    initialValues: {
      heading: props.node?.data?.heading || "",
      description: props.node?.data?.description || "",
      moreInfo: props.node?.data?.moreInfo || "",
      contactInfo: props.node?.data?.contactInfo || "",
      feedbackCTA: props.node?.data?.feedbackCTA || "",
      ...parseNextSteps(props.node?.data),
    },
    onSubmit: (values) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type, data: values });
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Top Banner">
          <InputRow>
            <Input
              placeholder="Heading"
              name="heading"
              value={formik.values.heading}
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputRow>
            <Input
              placeholder="Description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </InputRow>
        </ModalSectionContent>
      </ModalSection>

      <ModalSection>
        <ModalSectionContent title="Next Steps" Icon={ICONS[TYPES.TaskList]}>
          <ListManager
            values={formik.values.nextSteps}
            onChange={(steps: Step[]) => {
              formik.setFieldValue("nextSteps", steps);
            }}
            Editor={StepEditor}
            newValue={() => ({ title: "", description: "" })}
          />
        </ModalSectionContent>
      </ModalSection>

      <ModalSection>
        <ModalSectionContent
          title="More Information"
          Icon={ICONS[TYPES.Confirmation]}
        >
          <RichTextInput
            value={formik.values.moreInfo}
            name="moreInfo"
            onChange={formik.handleChange}
          />
        </ModalSectionContent>
      </ModalSection>

      <ModalSection>
        <ModalSectionContent title="Contact Us" Icon={ICONS[TYPES.Send]}>
          <RichTextInput
            value={formik.values.contactInfo}
            name="contactInfo"
            onChange={formik.handleChange}
          />
        </ModalSectionContent>
      </ModalSection>

      <ModalSection>
        <ModalSectionContent
          title="Feedback Call-To-Action"
          Icon={ICONS[TYPES.Notice]}
        >
          <Input
            value={formik.values.feedbackCTA}
            name="feedbackCTA"
            onChange={formik.handleChange}
          />
        </ModalSectionContent>
      </ModalSection>
    </form>
  );
}
