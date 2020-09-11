import { Button } from "@material-ui/core";
import { useFormik } from "formik";
import React from "react";
import Input from "./Input";
import arrayMove from "array-move";
import InputGroup from "./InputGroup";
import InputRow from "./InputRow";
import InternalNotes from "./InternalNotes";
import ModalCard from "./ModalCard";
import ModalSection from "./ModalSection";
import ModalSectionContent from "./ModalSectionContent";

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

function removeAt<T>(index: number, arr: Array<T>): Array<T> {
  return arr.filter((_task, i) => {
    return i !== index;
  });
}

const TaskList: React.FC<Props> = (props) => {
  const formik = useFormik<TaskList>({
    initialValues: props.value,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
    validate: () => {},
  });

  const addRow = () => {
    formik.setFieldValue("tasks", [
      ...formik.values.tasks,
      { title: "", description: "" },
    ]);
  };

  const handleMove = (dragIndex: number, hoverIndex: number) => {
    formik.setFieldValue(
      "tasks",
      arrayMove(formik.values.tasks, dragIndex, hoverIndex)
    );
  };

  const deleteRow = (index: number) => {
    formik.setFieldValue("tasks", removeAt(index, formik.values.tasks));
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <ModalCard>
        <ModalSection>
          <ModalSectionContent>
            <>
              {formik.values.tasks.map((task, index) => {
                return (
                  <InputGroup
                    deletable
                    draggable
                    index={index}
                    key={index}
                    handleMove={handleMove}
                    deleteInputGroup={() => deleteRow(index)}
                  >
                    <InputRow>
                      <Input
                        autoFocus
                        required
                        name={`tasks[${index}].title`}
                        value={task.title}
                        onChange={formik.handleChange}
                        placeholder="Title"
                      />
                    </InputRow>
                    <InputRow>
                      <Input
                        required
                        name={`tasks[${index}].description`}
                        onChange={formik.handleChange}
                        placeholder="Description"
                      />
                    </InputRow>
                  </InputGroup>
                );
              })}
              <Button color="primary" variant="contained" onClick={addRow}>
                Add another Task
              </Button>
            </>
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
export default TaskList;
