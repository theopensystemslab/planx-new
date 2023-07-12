import {
  DEFAULT_FLAG_CATEGORY,
  flatFlags,
} from "@opensystemslab/planx-core/types";
import { TYPES } from "@planx/components/types";
import { useFormik } from "formik";
import React from "react";

export interface Props {
  id?: string;
  handleSubmit?: (d: any, c?: any) => void;
  node?: any;
}

const Filter: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: {},
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        const children = props.id
          ? undefined
          : [
              ...flatFlags,
              {
                category: DEFAULT_FLAG_CATEGORY,
                text: "(No Result)",
                value: "",
              },
            ]
              .filter((f) => f.category === DEFAULT_FLAG_CATEGORY)
              .map((f) => ({
                type: TYPES.Response,
                data: {
                  text: f.text,
                  val: f.value,
                },
              }));

        props.handleSubmit(
          { type: TYPES.Filter, data: { newValues, fn: "flag" } },
          children,
        );
      }
    },
    validate: () => {},
  });
  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <h1>Filter Component</h1>
    </form>
  );
};

export default Filter;
