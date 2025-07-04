import Box from "@mui/material/Box";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { EditorProps } from "@planx/components/shared/types";
import type { Task, TaskList } from "@planx/components/TaskList/model";
import { parseTaskList } from "@planx/components/TaskList/model";
import { useFormik } from "formik";
import React, { ChangeEvent } from "react";
import ListManager, {
  EditorProps as ListManagerEditorProps,
} from "ui/editor/ListManager/ListManager";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import { ICONS } from "../shared/icons";

export type Props = EditorProps<TYPES.TaskList, TaskList>;

const newTask = (): Task => ({
  title: "",
  description: "",
});

const TaskEditor: React.FC<ListManagerEditorProps<Task>> = (props) => {
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
          disabled={props.disabled}
        />
      </InputRow>
      <InputRow>
        <RichTextInput
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
          disabled={props.disabled}
        />
      </InputRow>
    </Box>
  );
};

const TaskListComponent: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: parseTaskList(props.node?.data),
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.TaskList, data: newValues });
      }
    },
    validate: () => {},
  });
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
        <ModalSectionContent title="Task list" Icon={ICONS[TYPES.TaskList]}>
          <Box mb="1rem">
            <InputRow>
              <Input
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                placeholder="Main title"
                format="large"
                disabled={props.disabled}
              />
            </InputRow>
            <InputRow>
              <RichTextInput
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                placeholder="Main description"
                disabled={props.disabled}
              />
            </InputRow>
          </Box>
          <ListManager
            values={formik.values.tasks}
            onChange={(tasks: Array<Task>) => {
              formik.setFieldValue("tasks", tasks);
            }}
            Editor={TaskEditor}
            newValue={newTask}
            disabled={props.disabled}
            isTemplatedNode={props.node?.data?.isTemplatedNode}
          />
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} disabled={props.disabled} />
    </form>
  );
};

export default TaskListComponent;
