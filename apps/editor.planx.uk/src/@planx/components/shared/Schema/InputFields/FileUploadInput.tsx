import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { FileUploadSlot } from "@planx/components/FileUpload/model";
import type { FileUploadField } from "@planx/components/shared/Schema/model";
import React, { useEffect, useState } from "react";
import InputLegend from "ui/editor/InputLegend";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import { PrivateFileUpload } from "../../PrivateFileUpload/PrivateFileUpload";
import { getFieldProps, Props } from ".";
import { FieldInputDescription } from "./shared";

export const FileUploadInput: React.FC<Props<FileUploadField>> = (props) => {
  const { data, formik } = props;
  const { id, errorMessage, value, title, name } = getFieldProps(props);

  const [slots, setSlots] = useState<FileUploadSlot[]>(value ?? []);

  // Update formik state when slots are updated
  useEffect(() => {
    formik.setFieldValue(name, slots);
  }, [slots]);

  return (
    <Box component="fieldset">
      <InputLegend>
        <Typography variant="body1" pb={1}>
          <strong>{title}</strong>
        </Typography>
      </InputLegend>
      {data.description && (
        <FieldInputDescription description={data.description} />
      )}
      <ErrorWrapper id={`${id}-error`} error={errorMessage}>
        <PrivateFileUpload
          slots={slots}
          setSlots={setSlots}
          maxFiles={data.maxFiles}
        />
      </ErrorWrapper>
    </Box>
  );
};
