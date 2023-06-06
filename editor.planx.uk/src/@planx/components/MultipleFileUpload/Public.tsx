import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { PublicProps } from "@planx/components/ui";
import React, { useEffect, useRef, useState } from "react";
import { FONT_WEIGHT_BOLD } from "theme";
import ErrorWrapper from "ui/ErrorWrapper";
import { array } from "yup";

import { FileUploadSlot } from "../FileUpload/Public";
import Card from "../shared/Preview/Card";
import QuestionHeader from "../shared/Preview/QuestionHeader";
import { Dropzone } from "../shared/PrivateFileUpload/Dropzone";
import { FileStatus } from "../shared/PrivateFileUpload/FileStatus";
import { UploadedFileCard } from "../shared/PrivateFileUpload/UploadedFileCard";
import { getPreviouslySubmittedData, makeData } from "../shared/utils";
import { MultipleFileUpload } from "./model";

type Props = PublicProps<MultipleFileUpload>;

export default Component;

const slotsSchema = array()
  .required()
  .test({
    name: "nonUploading",
    message: "Upload at least one file",
    test: (slots?: Array<FileUploadSlot>) => {
      return Boolean(
        slots &&
          slots.length > 0 &&
          !slots.some((slot) => slot.status === "uploading")
      );
    },
  });

function Component(props: Props) {
  const recoveredSlots = getPreviouslySubmittedData(props)?.map(
    (slot: FileUploadSlot) => slot.cachedSlot
  );
  const [slots, setSlots] = useState<FileUploadSlot[]>(recoveredSlots ?? []);
  const [fileUploadStatus, setFileUploadStatus] = useState<string | undefined>(
    undefined
  );
  const [validationError, setValidationError] = useState<string | undefined>();

  const handleSubmit = () => {
    slotsSchema
      .validate(slots)
      .then(() => {
        props.handleSubmit?.(
          makeData(
            props,
            slots.map((slot) => ({
              url: slot.url,
              filename: slot.file.path,
              cachedSlot: {
                ...slot,
                file: {
                  path: slot.file.path,
                  type: slot.file.type,
                  size: slot.file.size,
                },
              },
            }))
          )
        );
      })
      .catch((err) => {
        setValidationError(err.message);
      });
  };

  /**
   * Declare a ref to hold a mutable copy the up-to-date validation error.
   * The intention is to prevent frequent unnecessary update loops that clears the
   * validation error state if it is already empty.
   */
  const validationErrorRef = useRef(validationError);
  useEffect(() => {
    validationErrorRef.current = validationError;
  }, [validationError]);

  useEffect(() => {
    if (validationErrorRef.current) {
      setValidationError(undefined);
    }
  }, [slots]);

  return (
    <Card
      handleSubmit={handleSubmit}
      isValid={slots.every((slot) => slot.url && slot.status === "success")}
    >
      <QuestionHeader title={props.title} description={props.description} />
      <Box>
        <FileStatus status={fileUploadStatus} />
        <Box sx={{ display: "flex", mb: 4, gap: 2 }}>
          <ErrorWrapper error={validationError} id={props.id}>
            <Box sx={{ flex: "50%" }}>
              <Dropzone
                slots={slots}
                setSlots={setSlots}
                setFileUploadStatus={setFileUploadStatus}
              />
            </Box>
          </ErrorWrapper>
          <Box sx={{ flex: "50%" }}>
            <Typography fontWeight={FONT_WEIGHT_BOLD}>
              Required files
            </Typography>
            {props.fileTypes.map((fileType) => (
              <p key={fileType.key}>{fileType.key}</p>
            ))}
          </Box>
        </Box>
        {slots.map((slot, index) => {
          return (
            <UploadedFileCard
              {...slot}
              key={slot.id}
              index={index}
              removeFile={() => {
                setSlots(
                  slots.filter((currentSlot) => currentSlot.file !== slot.file)
                );
                setFileUploadStatus(`${slot.file.path} was deleted`);
              }}
            />
          );
        })}
      </Box>
    </Card>
  );
}
