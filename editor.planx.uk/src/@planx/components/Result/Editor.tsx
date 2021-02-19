import { useFormik } from "formik";
import flags from "pages/FlowEditor/data/flags";
import React from "react";
import InputRow from "ui/InputRow";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";

import { TYPES } from "../types";
import { ICONS } from "../ui";
import type { Result } from "./model";

const ResultComponent: React.FC<Result> = (props) => {
  const formik = useFormik({
    initialValues: {
      // TODO: maybe don't store string key here as it's likely to change
      flagSet: props.node?.data?.flagSet || "",
    },
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.Result, data: newValues });
      }
    },
    validate: () => {},
  });
  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Result" Icon={ICONS[TYPES.Result]}>
          <InputRow>
            <label htmlFor="result-flagSet">Flag set</label>
            <select
              id="result-flagSet"
              name="flagSet"
              value={formik.values.flagSet}
              onChange={formik.handleChange}
              required
            >
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

export default ResultComponent;
