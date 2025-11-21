import { ComponentType } from "@opensystemslab/planx-core/types";
import { Form, Formik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { ComponentTagSelect } from "ui/editor/ComponentTagSelect";
import { InternalNotes } from "ui/editor/InternalNotes";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import { MoreInformation } from "ui/editor/MoreInformation/MoreInformation";
import { TemplatedNodeConfiguration } from "ui/editor/TemplatedNodeConfiguration";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";

import { ICONS } from "../shared/icons";
import type { EditorProps } from "../shared/types";
import { type Agent, parseAgent, validationSchema } from "./model";

type Props = EditorProps<ComponentType.Agent, Agent>;

const AgentComponent = (props: Props) => {
  const isTemplate = useStore((state) => state.isTemplate);

  const onSubmit = (newValues: Agent) => {
    if (props.handleSubmit) {
      props.handleSubmit({ type: ComponentType.Agent, data: newValues });
    }
  };

  return (
    <Formik<Agent>
      initialValues={parseAgent(props.node?.data)}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
      validateOnChange={false}
      validateOnBlur={false}
    >
      {(formik) => (
        <Form id="modal" name="modal">
          <TemplatedNodeInstructions
            isTemplatedNode={formik.values.isTemplatedNode}
            templatedNodeInstructions={formik.values.templatedNodeInstructions}
            areTemplatedNodeInstructionsRequired={
              formik.values.areTemplatedNodeInstructionsRequired
            }
          />
          <ModalSection>
            <ModalSectionContent
              title="Agent"
              Icon={ICONS[ComponentType.Agent]}
            >
              <p>TODO!</p>
            </ModalSectionContent>
          </ModalSection>
          <MoreInformation formik={formik} disabled={props.disabled} />
          <InternalNotes
            name="notes"
            onChange={formik.handleChange}
            value={formik.values.notes}
            disabled={props.disabled}
          />
          <ComponentTagSelect
            onChange={(value) => formik.setFieldValue("tags", value)}
            value={formik.values.tags}
            disabled={props.disabled}
          />
          {isTemplate && (
            <TemplatedNodeConfiguration
              formik={formik}
              isTemplatedNode={formik.values.isTemplatedNode}
              templatedNodeInstructions={
                formik.values.templatedNodeInstructions
              }
              areTemplatedNodeInstructionsRequired={
                formik.values.areTemplatedNodeInstructionsRequired
              }
              disabled={props.disabled}
            />
          )}
        </Form>
      )}
    </Formik>
  );
};

export default AgentComponent;
