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
  onSubmit?: () => void;
}

export interface TaskList {
  tasks: Array<Task>;
  notes?: string;
}

export interface Task {
  title: string;
  description: string;
}

const useTaskEditorStyles = makeStyles((_theme) => ({
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
  return (
    <form
      onSubmit={() => {
        if (props.onSubmit) {
          props.onSubmit();
        }
      }}
    >
      <ModalCard>
        <ModalSection>
          <ModalSectionContent>
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
      </ModalCard>
    </form>
  );
};
export default TaskListEditor;
