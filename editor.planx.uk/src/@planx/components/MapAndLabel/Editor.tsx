import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import React from "react";

import { EditorProps } from "../ui";
import { MapAndLabel, parseContent } from "./model";

type Props = EditorProps<TYPES.MapAndLabel, MapAndLabel>;

export default MapAndLabelComponent;

function MapAndLabelComponent(props: Props) {
  const formik = useFormik({
    initialValues: parseContent(props.node?.data),
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.MapAndLabel,
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
