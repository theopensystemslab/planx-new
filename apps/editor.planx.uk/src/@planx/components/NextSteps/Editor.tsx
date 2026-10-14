import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import type { NextSteps, Step } from "@planx/components/NextSteps/model";
import {
  DEFAULT_RULE,
  parseNextSteps,
  validationSchema,
} from "@planx/components/NextSteps/model";
import { RuleBuilder } from "@planx/components/shared/RuleBuilder";
import { Condition } from "@planx/components/shared/RuleBuilder/types";
import type { EditorProps } from "@planx/components/shared/types";
import { useFormikWithRef } from "@planx/components/shared/useFormikWithRef";
import type { ChangeEvent } from "react";
import type { EditorProps as ListManagerEditorProps } from "ui/editor/ListManager/ListManager";
import ListManager from "ui/editor/ListManager/ListManager";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { Switch } from "ui/shared/Switch";

type Props = EditorProps<TYPES.NextSteps, NextSteps>;

const newStep = (): Step => ({
  title: "",
  description: "",
  url: "",
});

type TaskEditorProps = ListManagerEditorProps<Step> & {
  hasStepRules?: boolean;
};

const TaskEditor: React.FC<TaskEditorProps> = (props) => {
  return (
    <Box sx={{ flex: 1 }}>
      <InputRow>
        <Input
          required
          name="title"
          multiline
          value={props.value.title}
          onChange={(ev: ChangeEvent<HTMLInputElement>) => {
            props.onChange({
              ...props.value,
              title: ev.target.value,
            });
          }}
          placeholder="Title"
          format="bold"
          disabled={props.disabled}
        />
      </InputRow>
      <Collapse in={!props.isCollapsed} timeout="auto">
        <InputRow>
          <Input
            name="description"
            value={props.value.description || ""}
            multiline
            onChange={(ev: ChangeEvent<HTMLInputElement>) => {
              props.onChange({
                ...props.value,
                description: ev.target.value,
              });
            }}
            placeholder="Description"
            disabled={props.disabled}
          />
        </InputRow>
        <InputRow>
          <Input
            name="url"
            type="url"
            value={props.value.url || ""}
            onChange={(ev: ChangeEvent<HTMLInputElement>) => {
              props.onChange({
                ...props.value,
                url: ev.target.value,
              });
            }}
            placeholder="url"
            disabled={props.disabled}
          />
        </InputRow>
        {props.hasStepRules && (
          <RuleBuilder
            labels={{
              [Condition.AlwaysRequired]: "Always show",
              [Condition.RequiredIf]: "Show if",
            }}
            dataSchema={[]}
            conditions={[Condition.AlwaysRequired, Condition.RequiredIf]}
            disabled={props.disabled}
            rule={props.value.rule || DEFAULT_RULE}
            onChange={(rule) => props.onChange({ ...props.value, rule })}
          />
        )}
      </Collapse>
    </Box>
  );
};

const NextStepsComponent: React.FC<Props> = (props) => {
  const formik = useFormikWithRef<NextSteps>(
    {
      initialValues: parseNextSteps(props.node?.data),
      onSubmit: (newValues) => {
        if (props.handleSubmit) {
          props.handleSubmit({ type: TYPES.NextSteps, data: newValues });
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
        <ModalSectionContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            If you want users to continue to the next step in the service from a
            given step, leave that URL section empty.
          </Typography>
          <Box sx={{ mb: "1rem" }}>
            <InputRow>
              <Input
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                placeholder="Main Title"
                format="bold"
                disabled={props.disabled}
                errorMessage={formik.errors.title}
              />
            </InputRow>
            <InputRow>
              <RichTextInput
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                placeholder="Main Description"
                disabled={props.disabled}
                errorMessage={formik.errors.description}
              />
            </InputRow>
          </Box>
          <InputRow>
            <Switch
              name="hasStepRules"
              checked={Boolean(formik.values.hasStepRules)}
              onChange={formik.handleChange}
              label="Set rules when to show a step"
              disabled={props.disabled}
            />
          </InputRow>
          <ListManager
            values={formik.values.steps}
            onChange={(steps: Array<Step>) => {
              formik.setFieldValue("steps", steps);
            }}
            Editor={TaskEditor}
            editorExtraProps={{ hasStepRules: formik.values.hasStepRules }}
            newValue={newStep}
            itemName="step"
            disabled={props.disabled}
            collapsible={true}
          />
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} disabled={props.disabled} />
    </form>
  );
};

export default NextStepsComponent;
