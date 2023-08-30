import Box from "@mui/material/Box";
import type { Task, TaskList } from "@planx/components/TaskList/model";
import { parseTaskList } from "@planx/components/TaskList/model";
import { TYPES } from "@planx/components/types";
import {
  EditorProps,
  ICONS,
  InternalNotes,
  MoreInformation,
} from "@planx/components/ui";
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
      <ModalSection>
        <ModalSectionContent title="Task List" Icon={ICONS[TYPES.TaskList]}>
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
            values={formik.values.tasks}
            onChange={(tasks: Array<Task>) => {
              formik.setFieldValue("tasks", tasks);
            }}
            Editor={TaskEditor}
            newValue={newTask}
          />
        </ModalSectionContent>
      </ModalSection>
      <MoreInformation
        changeField={formik.handleChange}
        definitionImg={formik.values.definitionImg}
        howMeasured={formik.values.howMeasured}
        policyRef={formik.values.policyRef}
        info={formik.values.info}
      />
      <InternalNotes
        name="notes"
        onChange={formik.handleChange}
        value={formik.values.notes}
      />
    </form>
  );
};

export default TaskListComponent;
