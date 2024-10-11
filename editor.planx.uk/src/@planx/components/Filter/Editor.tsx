import Typography from "@mui/material/Typography";
import {
  ComponentType as TYPES,
  DEFAULT_FLAG_CATEGORY,
  flatFlags,
} from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import React from "react";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";

import { ICONS } from "../ui";

export interface Props {
  id?: string;
  handleSubmit?: (data: any, children?: any) => void;
  node?: any;
}

const Filter: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: {
      fn: "flag",
      category: props?.node?.data?.category || DEFAULT_FLAG_CATEGORY,
    },
    onSubmit: (newValues) => {
      if (props?.handleSubmit) {
        const children = [
          ...flatFlags,
          {
            category: formik.values.category,
            text: "No flag result",
            value: "",
          },
        ]
          .filter((f) => f.category === formik.values.category)
          .map((f) => ({
            type: TYPES.Answer,
            data: {
              text: f.text,
              val: f.value,
            },
          }));

        props.handleSubmit({ type: TYPES.Filter, data: newValues }, children);
      }
    },
  });

  const categories = new Set(flatFlags.map((flag) => flag.category));

  return (
    <form
      onSubmit={formik.handleSubmit}
      id="modal"
      data-testid="filter-component-form"
    >
      <ModalSection>
        <ModalSectionContent title="Filter" Icon={ICONS[TYPES.Filter]}>
          <Typography variant="body2">
            Filters automatically sort based on collected flags. Flags within a
            category are ordered heirarchically and the filter will route
            through the left-most matching flag option only.
          </Typography>
        </ModalSectionContent>
        <ModalSectionContent title="Pick a flagset category (coming soon)">
          <select
            data-testid="flagset-category-select"
            name="category"
            value={formik.values.category}
            onChange={formik.handleChange}
            disabled
          >
            {Array.from(categories).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </ModalSectionContent>
      </ModalSection>
    </form>
  );
};

export default Filter;
