import Box from "@mui/material/Box";
import { EditorProps, ICONS } from "@planx/components/ui";
import { useFormik } from "formik";
import React, { ChangeEvent } from "react";
import ListManager, {
  EditorProps as ListManagerEditorProps,
} from "ui/editor/ListManager";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput";
import Input from "ui/shared/Input";
import InputRow from "ui/shared/InputRow";

import { TYPES } from "../types";
import { Confirmation, parseNextSteps, Step } from "./model";

export type Props = EditorProps<TYPES.Confirmation, Confirmation>;

function StepEditor(props: ListManagerEditorProps<Step>) {
  return (
    <Box width="100%">
      <InputRow>
        <Input
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
      heading: props.node?.data?.heading || "Application sent",
      description:
        props.node?.data?.description ||
        `A payment receipt has been emailed to you. You will also receive an email to confirm when your application has been received.`,
      moreInfo:
        props.node?.data?.moreInfo ||
        `<h2>You will be contacted</h2>
        <ul>
        <li>if there is anything missing from the information you have provided so far</li>
        <li>if any additional information is required</li>
        <li>to arrange a site visit, if required</li>
        <li>to inform you whether a certificate has been granted or not</li>
        </ul>`,
      contactInfo:
        props.node?.data?.contactInfo ||
        `You can contact us at <em>planning@lambeth.gov.uk</em>
          <br/><br/>
          What did you think of this service? Please give us your feedback using the link in the footer below.`,
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
    </form>
  );
}
