import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import React from "react";

import { EditorProps } from "../ui";
import { Page, parsePage } from "./model";

type Props = EditorProps<TYPES.Page, Page>;

export default PageComponent;

function PageComponent(props: Props) {
  const formik = useFormik({
    initialValues: parsePage(props.node?.data),
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.Page,
        data: newValues,
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      //...
    </form>
  );
}
