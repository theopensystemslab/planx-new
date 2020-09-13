import { useFormik } from "formik";
import React, { ChangeEvent } from "react";
import { makeStyles } from "@material-ui/core";
import Input from "./Input";
import InputRow from "./InputRow";
import RichTextInput from "./RichTextInput";
import InternalNotes from "./InternalNotes";
import ModalCard from "./ModalCard";
import ModalSection from "./ModalSection";
import ModalSectionContent from "./ModalSectionContent";
import ListManager, { EditorProps } from "./ListManager";

//Shared interface between all the editor components
export interface Props {
  definition?: string;
  value: TaskList;
  onChange: (newValue: TaskList) => void;
}

export interface TaskList {
  tasks: Array<Task>;
  notes?: string;
}

export interface Task {
  title: string;
  description: string;
}

const useTaskEditorStyles = makeStyles((theme) => ({
  container: {
    flex: "1",
  },
}));

const TaskEditor: React.FC<EditorProps<Task>> = (props) => {
  const classes = useTaskEditorStyles();
  return (
    <div className={classes.container}>
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
    </div>
  );
};

const newTask = (): Task => ({
  title: "",
  description: "",
});

const TaskListEditor: React.FC<Props> = (props) => {
  const formik = useFormik<TaskList>({
    initialValues: props.value,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
    validate: () => {},
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <ModalCard>
        <ModalSection>
          <ModalSectionContent>
            <ListManager
              values={formik.values.tasks}
              onChange={(newTasks: Array<Task>) => {
                formik.setFieldValue("tasks", newTasks);
              }}
              Editor={TaskEditor}
              newValue={newTask}
            />
          </ModalSectionContent>
        </ModalSection>
        <InternalNotes
          name="notes"
          onChange={formik.handleChange}
          value={formik.values.notes}
        />
      </ModalCard>
    </form>
  );
};
export default TaskListEditor;
