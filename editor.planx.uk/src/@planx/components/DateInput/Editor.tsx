import Box from "@mui/material/Box";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import {
  DateInput,
  editorValidationSchema,
  paddedDate,
  parseDateInput,
} from "@planx/components/DateInput/model";
import { EditorProps } from "@planx/components/shared/types";
import { useFormik } from "formik";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import DateInputUi from "ui/shared/DateInput/DateInput";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import { DataFieldAutocomplete } from "../shared/DataFieldAutocomplete";
import { ICONS } from "../shared/icons";

export type Props = EditorProps<TYPES.DateInput, DateInput>;

const DateInputComponent: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: parseDateInput(props.node?.data),
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({
          type: TYPES.DateInput,
          data: newValues,
        });
      }
    },
    validateOnChange: false,
    validationSchema: editorValidationSchema(),
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal" name="modal">
      <ModalSection>
        <ModalSectionContent title="Date input" Icon={ICONS[TYPES.DateInput]}>
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
          <Box mt={2}>
            <InputRow>
              <DateInputUi
                id={`${props.id}-min`}
                label="min"
                value={formik.values.min}
                error={formik.errors.min}
                onChange={(newDate: string, eventType: string) => {
                  formik.setFieldValue("min", paddedDate(newDate, eventType));
                }}
              />
            </InputRow>
          </Box>
          <Box mt={2}>
            <InputRow>
              <DateInputUi
                id={`${props.id}-max`}
                label="max"
                value={formik.values.max}
                error={formik.errors.max}
                onChange={(newDate: string, eventType: string) => {
                  formik.setFieldValue("max", paddedDate(newDate, eventType));
                }}
              />
            </InputRow>
          </Box>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} />
    </form>
  );
};

export default DateInputComponent;
