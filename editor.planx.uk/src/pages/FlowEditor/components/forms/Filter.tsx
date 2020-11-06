import { useFormik } from "formik";
import React from "react";

import flags from "../../data/flags";
import { TYPES } from "../../data/types";

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
              ...flags,
              {
                category: "Planning permission",
                text: "(No Result)",
              },
            ]
              .filter((f) => f.category === "Planning permission")
              .map((f) => ({
                type: TYPES.Response,
                data: {
                  text: f.text,
                  val: f.value,
                },
              }));

        props.handleSubmit(
          { type: TYPES.Filter, data: { newValues, fn: "flag" } },
          children
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
