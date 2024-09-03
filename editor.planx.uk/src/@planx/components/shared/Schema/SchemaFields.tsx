import Box from "@mui/material/Box";
import { SxProps, Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
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
  sx?: SxProps<Theme>;
}

const ListRows = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 0),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
}));

/**
 * Display a set of fields for the provided schema
 */
export const SchemaFields: React.FC<SchemaFieldsProps> = ({
  schema,
  formik,
  sx,
  activeIndex = 0,
}) => (
  <ListRows sx={sx}>
    {schema.fields.map((field, i) => (
      <InputRow key={i}>
        <InputFields {...field} activeIndex={activeIndex} formik={formik} />
      </InputRow>
    ))}
  </ListRows>
);
