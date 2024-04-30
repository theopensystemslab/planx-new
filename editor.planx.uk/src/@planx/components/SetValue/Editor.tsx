import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { EditorProps, InternalNotes } from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import Input from "ui/shared/Input";
import InputRow from "ui/shared/InputRow";
import Radio from "ui/shared/Radio";

import { parseSetValue, SetValue } from "./model";

type Props = EditorProps<TYPES.SetValue, SetValue>;

export default SetValueComponent;

interface Option {
  value: SetValue["operation"];
  label: string;
}

const options: Option[] = [
  {
    value: "replace",
    label: "Replace",
  },
  {
    value: "append",
    label: "Append",
  },
  {
    value: "removeOne",
    label: "Remove single value",
  },
  {
    value: "removeAll",
    label: "Remove all values",
  },
];

const DescriptionText: React.FC<SetValue> = ({ fn, val, operation }) => {
  if (!fn || !val) return null;

  switch (operation) {
    case "replace":
      return (
        <Typography mb={2}>
          Any existing value for <strong>{fn}</strong> will be replaced by{" "}
          <strong>{val}</strong>
        </Typography>
      );
    case "append":
      return (
        <Typography mb={2}>
          Any existing value for <strong>{fn}</strong> will have{" "}
          <strong>{val}</strong> appended to it
        </Typography>
      );
    case "removeOne":
      return (
        <Typography mb={2}>
          Any existing value for <strong>{fn}</strong> set to{" "}
          <strong>{val}</strong> will be removed
        </Typography>
      );
    case "removeAll":
      return (
        <Typography mb={2}>
          All existing values for <strong>{fn}</strong> will be removed
        </Typography>
      );
  }
};

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
            <Input
              required
              format="data"
              name="val"
              value={formik.values.val}
              placeholder="value"
              onChange={formik.handleChange}
            />
          </InputRow>
        </ModalSectionContent>
        <ModalSectionContent title="Operation">
          <DescriptionText {...formik.values} />
          <Radio
            options={options}
            value={formik.values.operation}
            onChange={(newOperation) => {
              formik.setFieldValue("operation", newOperation);
            }}
          />
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
