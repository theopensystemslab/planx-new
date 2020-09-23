import React from "react";
import TaskListEditor from "../../../../ui/TaskListEditor";
import { useFormik } from "formik";
import { TYPES } from "../../data/types";

export interface Props {
  id?: string;
  handleSubmit?: (d: any) => void;
  node?: any;
}

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
