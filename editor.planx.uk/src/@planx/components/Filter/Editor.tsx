import { useFormik } from "formik";
import flags, { flatFlags } from "pages/FlowEditor/data/flags";
import React from "react";
import InputRow from "ui/InputRow";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";

import { TYPES } from "../types";
import { ICONS } from "../ui";
import type { Filter } from "./model";

const FilterComponent: React.FC<Filter> = (props) => {
  const formik = useFormik({
    initialValues: {
      // TODO: maybe don't store string key here as it's likely to change
      flagSet: props.node?.data?.flagSet || "",
      visible: !!props.node?.data?.visible,
    },
    onSubmit: (newValues) => {
      console.log({ newValues });
      if (props.handleSubmit) {
        const children = props.id
          ? undefined
          : [
              ...flatFlags,
              {
                category: newValues.flagSet,
                text: "(No Filter)",
              },
            ]
              .filter((f) => f.category === newValues.flagSet)
              .map((f) => ({
                type: TYPES.Response,
                data: {
                  text: f.text,
                  val: f.value,
                },
              }));

        props.handleSubmit({ type: TYPES.Filter, data: newValues }, children);
      }
    },
    validate: () => {},
  });
  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Filter" Icon={ICONS[TYPES.Filter]}>
          <InputRow>
            <label htmlFor="filter-flagSet">Flag set</label>
            <select
              id="filter-flagSet"
              name="flagSet"
              value={formik.values.flagSet}
              onChange={formik.handleChange}
              disabled={!!props.id}
              required={!props.id}
            >
              <option />
              {Object.keys(flags).map((flagSet) => (
                <option key={flagSet} value={flagSet}>
                  {flagSet}
                </option>
              ))}
            </select>
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
    </form>
  );
};

export default FilterComponent;
