import { MoreInformation } from "@planx/components/shared";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { Store, useStore } from "pages/FlowEditor/lib/store";
import type { handleSubmit } from "pages/Preview/Node";
import React, { useEffect, useRef, useState } from "react";
import { FileWithPath } from "react-dropzone";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import { array } from "yup";

import { PASSPORT_REQUESTED_FILES_KEY } from "../FileUploadAndLabel/model";
import { PrivateFileUpload } from "../shared/PrivateFileUpload/PrivateFileUpload";
import { getPreviouslySubmittedData, makeData } from "../shared/utils";

interface Props extends MoreInformation {
  id?: string;
  title?: string;
  fn: string;
  description?: string;
  handleSubmit: handleSubmit;
  previouslySubmittedData?: Store.userData;
}

export interface FileUploadSlot {
  file: FileWithPath;
  status: "success" | "error" | "uploading";
  progress: number;
  id: string;
  url?: string;
  cachedSlot?: Omit<FileUploadSlot, "cachedSlot">;
}

const slotsSchema = array()
  .required()
  .test({
    name: "nonUploading",
    message: "Upload at least one file.",
    test: (slots?: Array<FileUploadSlot>) => {
      return Boolean(
        slots &&
          slots.length > 0 &&
          !slots.some((slot) => slot.status === "uploading"),
      );
    },
  });

const FileUpload: React.FC<Props> = (props) => {
  const recoveredSlots = getPreviouslySubmittedData(props)?.map(
    (slot: FileUploadSlot) => slot.cachedSlot,
  );
  const [slots, setSlots] = useState<FileUploadSlot[]>(recoveredSlots ?? []);
  const [validationError, setValidationError] = useState<string>();

  const uploadedFiles = (slots: FileUploadSlot[]) =>
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
      })),
    );

  const updatedRequestedFiles = () => {
    const { required, recommended, optional } = useStore
      .getState()
      .requestedFiles();

    return {
      [PASSPORT_REQUESTED_FILES_KEY]: {
        required: [...required, props.fn],
        recommended,
        optional,
      },
    };
  };

  const handleSubmit = () => {
    slotsSchema
      .validate(slots)
      .then(() => {
        props.handleSubmit({
          data: {
            ...uploadedFiles(slots).data,
            ...updatedRequestedFiles(),
          },
        });
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
      isValid={
        slots.length > 0 &&
        slots.every((slot) => slot.url && slot.status === "success")
      }
      handleSubmit={handleSubmit}
    >
      <QuestionHeader
        title={props.title}
        description={props.description}
        info={props.info}
        howMeasured={props.howMeasured}
        definitionImg={props.definitionImg}
        policyRef={props.policyRef}
      />
      <ErrorWrapper error={validationError} id={props.id}>
        <PrivateFileUpload slots={slots} setSlots={setSlots} />
      </ErrorWrapper>
    </Card>
  );
};

export default FileUpload;
