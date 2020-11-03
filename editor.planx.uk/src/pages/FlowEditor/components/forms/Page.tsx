import { useFormik } from "formik";
import React from "react";
import { TYPES } from "../../data/types";

const PageForm: React.FC<{
  id?: string;
  handleSubmit?;
}> = ({ id, handleSubmit }) => {
  const formik = useFormik({
    initialValues: {},
    onSubmit: (values) => {
      if (handleSubmit) {
        handleSubmit({ type: TYPES.Page, data: values });
      } else {
        alert(JSON.stringify(values, null, 2));
      }
    },
  });

  return (
    <form id="modal" onSubmit={formik.handleSubmit} data-testid="form">
      Page
    </form>
  );
};

export default PageForm;
