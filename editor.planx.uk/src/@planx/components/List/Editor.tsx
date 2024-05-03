import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import React from "react";
import { FeaturePlaceholder } from "ui/editor/FeaturePlaceholder";

import { EditorProps } from "../ui";
import { List, parseContent } from "./model";

type Props = EditorProps<TYPES.List, List>;

function ListComponent(props: Props) {
  const formik = useFormik({
    initialValues: parseContent(props.node?.data),
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.List,
        data: newValues,
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <FeaturePlaceholder title="Under development" />
    </form>
  );
}

export default ListComponent;
