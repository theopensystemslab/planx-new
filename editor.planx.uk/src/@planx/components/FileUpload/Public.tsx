import { MoreInformation } from "@planx/components/shared";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { uploadPrivateFile } from "api/upload";
import { nanoid } from "nanoid";
import { Store } from "pages/FlowEditor/lib/store";
import type { handleSubmit } from "pages/Preview/Node";
import React, { useEffect, useRef, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Dropzone } from "ui/Dropzone";
import ErrorWrapper from "ui/ErrorWrapper";
import { UploadedFileCard } from "ui/UploadedFileCard";
import { array } from "yup";

import handleRejectedUpload from "../shared/handleRejectedUpload";
import { getPreviouslySubmittedData, makeData } from "../shared/utils";

interface Props extends MoreInformation {
  id?: string;
  title?: string;
  fn?: string;
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
          !slots.some((slot) => slot.status === "uploading")
      );
    },
  });

const FileUpload: React.FC<Props> = (props) => {
  const recoveredSlots = getPreviouslySubmittedData(props)?.map(
    (slot: FileUploadSlot) => slot.cachedSlot
  );
  const [slots, setSlots] = useState<FileUploadSlot[]>(recoveredSlots ?? []);
  const [validationError, setValidationError] = useState<string>();
  const [fileUploadStatus, setFileUploadStatus] = useState<string>();

  const handleSubmit = () => {
    slotsSchema
      .validate(slots)
      .then(() => {
        props.handleSubmit(
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
        <PrivateFileUpload
          slots={slots}
          setSlots={setSlots}
          fileUploadStatus={fileUploadStatus}
          setFileUploadStatus={setFileUploadStatus}
        />
      </ErrorWrapper>
    </Card>
  );
};

interface PrivateFileUploadProps {
  slots: FileUploadSlot[];
  setSlots: React.Dispatch<React.SetStateAction<FileUploadSlot[]>>;
  fileUploadStatus?: string;
  setFileUploadStatus: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const PrivateFileUpload: React.FC<PrivateFileUploadProps> = ({
  slots,
  setSlots,
  fileUploadStatus,
  setFileUploadStatus,
}) => {
  const MAX_UPLOAD_SIZE_MB = 30;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
    },
    maxSize: MAX_UPLOAD_SIZE_MB * 1e6,
    multiple: true,
    onDrop: (acceptedFiles: FileWithPath[]) => {
      setSlots((slots) => {
        return [
          ...slots,
          ...acceptedFiles.map((file) => {
            // XXX: This is a non-blocking promise chain
            //      If a file is removed while it's being uploaded, nothing should break because we're using map()
            uploadPrivateFile(file, {
              onProgress: (progress) => {
                setSlots((_files) =>
                  _files.map((_file) =>
                    _file.file === file ? { ..._file, progress } : _file
                  )
                );
              },
            })
              .then((url: string) => {
                setSlots((_files) =>
                  _files.map((_file) =>
                    _file.file === file
                      ? { ..._file, url, status: "success" }
                      : _file
                  )
                );
                setFileUploadStatus(() =>
                  acceptedFiles.length > 1
                    ? `Files ${acceptedFiles
                        .map((file) => file.path)
                        .join(", ")} were uploaded`
                    : `File ${acceptedFiles[0].path} was uploaded`
                );
              })
              .catch((error) => {
                console.error(error);
                setSlots((_files) =>
                  _files.map((_file) =>
                    _file.file === file ? { ..._file, status: "error" } : _file
                  )
                );
              });
            return {
              file,
              status: "uploading" as FileUploadSlot["status"],
              progress: 0,
              id: nanoid(),
            };
          }),
        ];
      });
    },
    onDropRejected: handleRejectedUpload,
  });

  return (
    <>
      {slots.map((slot, index) => {
        return (
          <UploadedFileCard
            {...slot}
            key={slot.id}
            index={index}
            onClick={() => {
              setSlots((slots) =>
                slots.filter((currentSlot) => currentSlot.file !== slot.file)
              );
              setFileUploadStatus(() => `${slot.file.path} was deleted`);
            }}
          />
        );
      })}
      <Dropzone
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        isDragActive={isDragActive}
        fileUploadStatus={fileUploadStatus}
      />
    </>
  );
};

export default FileUpload;
