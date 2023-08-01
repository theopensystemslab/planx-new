import { TYPES } from "@planx/components/types";
import { EditorProps, InternalNotes } from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import Input from "ui/Input";
import InputRow from "ui/InputRow";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";

import { parseSetValue, SetValue } from "./model";

type Props = EditorProps<TYPES.SetValue, SetValue>;

export default SetValueComponent;

function SetValueComponent(props: Props) {
  const formik = useFormik({
    initialValues: parseSetValue(props.node?.data),
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.SetValue,
        data: newValues,
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Passport field name">
          <InputRow>
            <Input
              required
              format="data"
              name="fn"
              value={formik.values.fn}
              placeholder="key"
              onChange={formik.handleChange}
            />
          </InputRow>
        </ModalSectionContent>
        <ModalSectionContent title="Field value">
          <InputRow>
            <div>
              <Input
                required
                format="data"
                name="val"
                value={formik.values.val}
                placeholder="value"
                onChange={formik.handleChange}
              />
              {formik.values.fn && formik.values.val && (
                <p>
                  any existing value for <strong>{formik.values.fn}</strong>{" "}
                  will be replaced by <strong>{formik.values.val}</strong>
                </p>
              )}
            </div>
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
      <InternalNotes
        name="notes"
        value={formik.values.notes}
        onChange={formik.handleChange}
      />
    </form>
  );
}
