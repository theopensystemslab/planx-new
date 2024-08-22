import { FormikProps } from "formik";
import React from "react";
import InputRow from "ui/shared/InputRow";

import { InputFields } from "./InputFields";
import { Schema, SchemaUserData } from "./model";

interface SchemaFieldsProps {
  /**
   * Optional index of currently active schema instance.
   * Only required if multiple user responses are allowed, e.g. in the List component.
   * Defaults to 0 as `SchemaUserData` always holds an array of responses
   */
  activeIndex?: number;
  /** Formik instance generated from config provided by useSchema hook */
  formik: FormikProps<SchemaUserData>;
  schema: Schema;
}

/**
 * Display a set of fields for the provided schema
 */
export const SchemaFields: React.FC<SchemaFieldsProps> = ({
  schema,
  formik,
  activeIndex = 0,
}) =>
  schema.fields.map((field, i) => (
    <InputRow key={i}>
      <InputFields {...field} activeIndex={activeIndex} formik={formik} />
    </InputRow>
  ));
