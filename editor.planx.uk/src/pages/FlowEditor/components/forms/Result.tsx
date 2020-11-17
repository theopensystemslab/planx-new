import { TYPES } from "@planx/components/types";
import { useFormik } from "formik";
import React from "react";

export interface Props {
  id?: string;
  handleSubmit?: (d: any) => void;
  node?: any;
}

const ResultComponent: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: {},
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.Result, data: newValues });
      }
    },
    validate: () => {},
  });
  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <h1>Result Component</h1>
    </form>
  );
};

export default ResultComponent;
