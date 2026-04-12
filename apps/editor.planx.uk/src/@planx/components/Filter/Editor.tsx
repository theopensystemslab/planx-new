import Typography from "@mui/material/Typography";
import {
  ComponentType as TYPES,
  DEFAULT_FLAG_CATEGORY,
  flatFlags,
  Node,
} from "@opensystemslab/planx-core/types";
import { useFormikWithRef } from "@planx/components/shared/useFormikWithRef";
import { FormikProps } from "formik";
import React, { MutableRefObject } from "react";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";

import { ICONS } from "../shared/icons";

interface FilterData {
  fn: string;
  category: string;
}

export interface Props {
  id?: string;
  handleSubmit?: (data: any, children?: any) => void;
  node?: any;
  autoAnswer?: Node["id"];
  disabled?: boolean;
  formikRef?: MutableRefObject<FormikProps<FilterData> | null>;
}

const Filter: React.FC<Props> = (props) => {
  const formik = useFormikWithRef<FilterData>(
    {
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
    },
    props.formikRef,
  );

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
        <ModalSectionContent title="Pick a flagset category">
          <select
            data-testid="flagset-category-select"
            name="category"
            value={formik.values.category}
            onChange={formik.handleChange}
            disabled={props.disabled}
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
