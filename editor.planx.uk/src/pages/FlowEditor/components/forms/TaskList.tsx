import { makeStyles } from "@material-ui/core/styles";
import { useFormik } from "formik";
import React, { ChangeEvent } from "react";

import {
  Input,
  InputRow,
  InternalNotes,
  ListManager,
  ModalSection,
  ModalSectionContent,
  RichTextInput,
} from "../../../../ui";
import { EditorProps } from "../../../../ui/ListManager";
import { Task, TYPES } from "../../data/types";
import { ICONS } from "../shared";
import { MoreInformation } from "./shared";

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

const TaskListComponent: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: {
      // TODO: improve runtime validation here (joi, io-ts)
      tasks:
        /* remove once migrated */ props.node?.data?.taskList?.tasks ||
        props.node?.data?.tasks ||
        [],
      notes: props.node?.data?.notes || props.node?.date?.taskList?.notes || "",
      definitionImg: props.node?.data?.definitionImg,
      howMeasured: props.node?.data?.howMeasured,
      policyRef: props.node?.data?.policyRef,
      info: props.node?.data?.info,
    },
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
