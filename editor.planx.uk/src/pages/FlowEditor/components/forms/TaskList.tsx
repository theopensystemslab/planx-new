import React, { ChangeEvent } from "react";
import { makeStyles } from "@material-ui/core";
import { EditorProps } from "../../../../ui/ListManager";
import {
  ListManager,
  Input,
  InputRow,
  RichTextInput,
  InternalNotes,
  ModalSection,
  ModalSectionContent,
} from "../../../../ui";
import { useFormik } from "formik";
import { Task, TaskList, TYPES } from "../../data/types";
import { nodeIcon } from "../shared";

export interface Props {
  id?: string;
  handleSubmit?: (d: any) => void;
  node?: any;
}

const useTaskEditorStyles = makeStyles((_theme) => ({
  container: {
    flex: "1",
  },
}));

const newTask = (): Task => ({
  title: "",
  description: "",
});

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

export interface TaskListEditorProps {
  value: TaskList;
  onChange: (newValue: TaskList) => void;
}

const TaskListEditor: React.FC<TaskListEditorProps> = (props) => {
  return (
    <>
      <ModalSection>
        <ModalSectionContent title="Task List" Icon={nodeIcon(TYPES.TaskList)}>
          <ListManager
            values={props.value.tasks}
            onChange={(tasks: Array<Task>) => {
              props.onChange({
                ...props.value,
                tasks,
              });
            }}
            Editor={TaskEditor}
            newValue={newTask}
          />
        </ModalSectionContent>
      </ModalSection>
      <InternalNotes
        name="notes"
        onChange={(ev) => {
          props.onChange({
            ...props.value,
            notes: ev.target.value,
          });
        }}
        value={props.value.notes}
      />
    </>
  );
};

const TaskListComponent: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: {
      taskList: {
        // TODO: improve runtime validation here (joi, io-ts)
        notes: props.node?.taskList?.notes || "",
        tasks: props.node?.taskList?.tasks || [],
      },
    },
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ $t: TYPES.TaskList, ...newValues });
      }
    },
    validate: () => {},
  });
  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <TaskListEditor
        value={formik.values.taskList}
        onChange={(newTaskList) => {
          formik.setFieldValue("taskList", newTaskList);
        }}
      />
    </form>
  );
};

export default TaskListComponent;
