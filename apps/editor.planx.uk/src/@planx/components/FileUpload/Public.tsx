import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useRef, useState } from "react";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import { PASSPORT_REQUESTED_FILES_KEY } from "../FileUploadAndLabel/model";
import { PrivateFileUpload } from "../shared/PrivateFileUpload/PrivateFileUpload";
import { PublicProps } from "../shared/types";
import { getPreviouslySubmittedData, makeData } from "../shared/utils";
import { FileUpload, FileUploadSlot, slotsSchema } from "./model";

type Props = PublicProps<FileUpload>;

const FileUploadComponent: React.FC<Props> = (props) => {
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
        filename: slot.file.name,
        cachedSlot: {
          ...slot,
          file: {
            name: slot.file.name,
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
        props.handleSubmit &&
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
    <Card isValid={true} handleSubmit={handleSubmit}>
      <CardHeader
        title={props.title}
        description={props.description}
        info={props.info}
        howMeasured={props.howMeasured}
        definitionImg={props.definitionImg}
        policyRef={props.policyRef}
      />
      <ErrorWrapper error={validationError} id={props.id}>
        <PrivateFileUpload
          slots={slots}
          setSlots={setSlots}
          maxFiles={props.maxFiles}
        />
      </ErrorWrapper>
    </Card>
  );
};

export default FileUploadComponent;
