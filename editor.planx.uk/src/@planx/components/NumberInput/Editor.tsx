import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import type { NumberInput } from "@planx/components/NumberInput/model";
import { parseNumberInput } from "@planx/components/NumberInput/model";
import { EditorProps } from "@planx/components/shared/types";
import { useFormik } from "formik";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import InputRowLabel from "ui/shared/InputRowLabel";
import { Switch } from "ui/shared/Switch";

import { DataFieldAutocomplete } from "../shared/DataFieldAutocomplete";
import { ICONS } from "../shared/icons";

export type Props = EditorProps<TYPES.NumberInput, NumberInput>;

export default function NumberInputComponent(props: Props): FCReturn {
  const formik = useFormik<NumberInput>({
    initialValues: parseNumberInput(props.node?.data),
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.NumberInput, data: newValues });
      }
    },
    validate: () => {},
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent
          title="Number input"
          Icon={ICONS[TYPES.NumberInput]}
        >
          <InputRow>
            <Input
              format="large"
              name="title"
              value={formik.values.title}
              placeholder="Title"
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              placeholder="Description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </InputRow>
          <DataFieldAutocomplete
            value={formik.values.fn}
            onChange={(value) => formik.setFieldValue("fn", value)}
          />
          <InputRow>
            <InputRowLabel>units</InputRowLabel>
            <InputRowItem>
              <Input
                name="units"
                value={formik.values.units}
                placeholder="eg square metres"
                onChange={formik.handleChange}
              />
            </InputRowItem>
          </InputRow>
          <InputRow>
            <Switch
              checked={formik.values.allowNegatives}
              onChange={() =>
                formik.setFieldValue(
                  "allowNegatives",
                  !formik.values.allowNegatives,
                )
              }
              label="Allow negative numbers to be input"
            />
          </InputRow>
          <InputRow>
            <Switch
              checked={formik.values.isInteger}
              onChange={() =>
                formik.setFieldValue("isInteger", !formik.values.isInteger)
              }
              label="Only allow whole numbers"
            />
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} />
    </form>
  );
}
