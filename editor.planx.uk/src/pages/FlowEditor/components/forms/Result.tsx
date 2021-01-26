import { TYPES } from "@planx/components/types";
import { ICONS } from "@planx/components/ui";
import { useFormik } from "formik";
import flags, { flatFlags } from "pages/FlowEditor/data/flags";
import React from "react";
import InputRow from "ui/InputRow";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";

export interface Props {
  id?: string;
  handleSubmit?: (d: any, children: any) => void;
  node?: any;
}

const ResultComponent: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: {
      // TODO: maybe don't store string key here as it's likely to change
      flagSet: props.node?.data?.flagSet || "",
      visible: !!props.node?.data?.visible,
    },
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        const children = props.id
          ? undefined
          : [
              ...flatFlags,
              {
                category: newValues.flagSet,
                text: "(No Result)",
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

        props.handleSubmit({ type: TYPES.Result, data: newValues }, children);
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
          <InputRow>
            <label htmlFor="result-visible">Visible</label>
            <input
              type="checkbox"
              id="result-visible"
              name="visible"
              onChange={() =>
                formik.setFieldValue("visible", !formik.values.visible)
              }
              checked={formik.values.visible}
            />
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
    </form>
  );
};

export default ResultComponent;
