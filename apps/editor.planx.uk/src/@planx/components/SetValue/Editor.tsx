import FormControl from "@mui/material/FormControl";
import RadioGroup from "@mui/material/RadioGroup";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import BasicRadio from "@planx/components/shared/Radio/BasicRadio/BasicRadio";
import { EditorProps } from "@planx/components/shared/types";
import { useFormikWithRef } from "@planx/components/shared/useFormikWithRef";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import { DataFieldAutocomplete } from "../shared/DataFieldAutocomplete";
import { parseSetValue, SetValue, validationSchema } from "./model";

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
  const formik = useFormikWithRef<SetValue>(
    {
      initialValues: parseSetValue(props.node?.data),
      onSubmit: (newValues) => {
        props.handleSubmit?.({
          type: TYPES.SetValue,
          data: newValues,
        });
      },
      validationSchema,
    },
    props.formikRef,
  );

  const handleRadioChange = (event: React.SyntheticEvent<Element, Event>) => {
    const target = event.target as HTMLInputElement;
    formik.setFieldValue("operation", target.value);
  };

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <TemplatedNodeInstructions
        isTemplatedNode={formik.values.isTemplatedNode}
        templatedNodeInstructions={formik.values.templatedNodeInstructions}
        areTemplatedNodeInstructionsRequired={
          formik.values.areTemplatedNodeInstructionsRequired
        }
      />
      <ModalSection>
        <ModalSectionContent title="Passport field name">
          <DataFieldAutocomplete
            required
            value={formik.values.fn}
            onChange={(value) => formik.setFieldValue("fn", value)}
            disabled={props.disabled}
          />
        </ModalSectionContent>
        {formik.values.operation !== "removeAll" && (
          <ModalSectionContent title="Field value">
            <InputRow>
              <Input
                required
                format="data"
                name="val"
                value={formik.values.val}
                placeholder="value"
                onChange={formik.handleChange}
                disabled={props.disabled}
              />
            </InputRow>
          </ModalSectionContent>
        )}
        <ModalSectionContent title="Operation">
          <DescriptionText {...formik.values} />
          <FormControl component="fieldset">
            <RadioGroup defaultValue="replace" value={formik.values.operation}>
              {options.map((option) => (
                <BasicRadio
                  key={option.value}
                  id={option.value}
                  label={option.label}
                  variant="compact"
                  value={option.value}
                  onChange={handleRadioChange}
                  disabled={props.disabled}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter
        formik={formik}
        showMoreInformation={false}
        disabled={props.disabled}
      />
    </form>
  );
}
