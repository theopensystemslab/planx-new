import { useFormik } from "formik";
import React from "react";
import Card from "../shared/Card";

interface Props {
  node: any;
  handleSubmit?;
}

const TaskList: React.FC<Props> = () => {
  const formik = useFormik({
    initialValues: {
      selected: { a: "" },
    },
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
    validate: () => {},
  });
  return (
    <Card>
      <form onSubmit={formik.handleSubmit}>
        <p>TaskList placeholder</p>
      </form>
    </Card>
  );
};

export default TaskList;
