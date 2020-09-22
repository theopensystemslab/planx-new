import { useFormik } from "formik";
import React from "react";
import Card from "../shared/Card";

interface Props {
  node: any;
  handleSubmit?;
}

const TaskList: React.FC<Props> = (props) => {
  console.log(props.node);
  const formik = useFormik({
    initialValues: {
      selected: { a: "" },
    },
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
    validate: () => {},
  });
  const { a } = formik.values.selected;
  return (
    <Card>
      <form onSubmit={formik.handleSubmit}>
        <p>abcd</p>
      </form>
    </Card>
  );
};

export default TaskList;
