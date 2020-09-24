import { useFormik } from "formik";
import React from "react";
import { TYPES } from "../../data/types";

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
        props.handleSubmit({ $t: TYPES.Result, ...newValues });
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
