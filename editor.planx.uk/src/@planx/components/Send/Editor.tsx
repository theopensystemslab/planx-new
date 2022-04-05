import { useFormik } from "formik";
import React from "react";
import Input from "ui/Input";
import InputRow from "ui/InputRow";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";
import Radio from "ui/Radio";

import { TYPES } from "../types";
import { EditorProps, ICONS } from "../ui";
import type { Send } from "./model";
import { parseContent } from "./model";

export type Props = EditorProps<TYPES.Send, Send>;

const SendComponent: React.FC<Props> = (props) => {
  const formik = useFormik<Send>({
    initialValues: parseContent(props.node?.data),
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.Send, data: newValues });
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Send" Icon={ICONS[TYPES.Send]}>
          <InputRow>
            <Input
              format="large"
              name="title"
              value={formik.values.title}
              placeholder="Editor title"
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputRow>
            <Radio
              options={[
                {
                  value: "bops",
                  label: "BOPs",
                },
                {
                  value: "uniform",
                  label: "Uniform",
                },
              ]}
              value={formik.values.destination}
              onChange={(newDestination) => {
                formik.setFieldValue("destination", newDestination);
              }}
            />
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
    </form>
  );
};

export default SendComponent;
