import Box from "@mui/material/Box";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import type { NextSteps, Step } from "@planx/components/NextSteps/model";
import { parseNextSteps } from "@planx/components/NextSteps/model";
import { EditorProps, ICONS } from "@planx/components/ui";
import { useFormik } from "formik";
import React, { ChangeEvent } from "react";
import ListManager, {
  EditorProps as ListManagerEditorProps,
} from "ui/editor/ListManager/ListManager";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

type Props = EditorProps<TYPES.NextSteps, NextSteps>;

const newStep = (): Step => ({
  title: "",
  description: "",
  url: "",
});

const TaskEditor: React.FC<ListManagerEditorProps<Step>> = (props) => {
  return (
    <Box sx={{ flex: 1 }}>
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
      <InputRow>
        <Input
          name="url"
          type="url"
          value={props.value.url}
          onChange={(ev: ChangeEvent<HTMLInputElement>) => {
            props.onChange({
              ...props.value,
              url: ev.target.value,
            });
          }}
          placeholder="url"
        />
      </InputRow>
    </Box>
  );
};

const NextStepsComponent: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: parseNextSteps(props.node?.data),
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.NextSteps, data: newValues });
      }
    },
    validate: () => {},
  });
  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Next Steps" Icon={ICONS[TYPES.NextSteps]}>
          <Box mb="1rem">
            <InputRow>
              <Input
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                placeholder="Main Title"
                format="large"
              />
            </InputRow>
            <InputRow>
              <RichTextInput
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                placeholder="Main Description"
              />
            </InputRow>
          </Box>
          <ListManager
            values={formik.values.steps}
            onChange={(steps: Array<Step>) => {
              formik.setFieldValue("steps", steps);
            }}
            Editor={TaskEditor}
            newValue={newStep}
          />
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} />
    </form>
  );
};

export default NextStepsComponent;
