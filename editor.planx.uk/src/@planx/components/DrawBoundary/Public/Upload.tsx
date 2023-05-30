import { FileUploadSlot } from "@planx/components/FileUpload/Public";
import { uploadPrivateFile } from "api/upload";
import { nanoid } from "nanoid";
import React, { useEffect, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Dropzone } from "ui/Dropzone";
import { UploadedFileCard } from "ui/UploadedFileCard";

import handleRejectedUpload from "../../shared/handleRejectedUpload";

interface Props {
  setFile: (file?: FileUploadSlot) => void;
  initialFile?: FileUploadSlot;
}

export default function FileUpload(props: Props) {
  const [slot, setSlot] = useState<FileUploadSlot | undefined>(
    props.initialFile
  );
  const [fileUploadStatus, setFileUploadStatus] = useState<string>();
  const MAX_UPLOAD_SIZE_MB = 30;

  useEffect(() => {
    props.setFile(slot);
  }, [props.setFile, slot]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
    },
    maxSize: MAX_UPLOAD_SIZE_MB * 1e6,
    multiple: false,
    onDrop: ([file]: FileWithPath[]) => {
      // XXX: This is a non-blocking promise chain
      uploadPrivateFile(file, {
        onProgress: (progress) => {
          setSlot((_file) =>
            _file?.file === file ? { ..._file, progress } : _file
          );
        },
      })
        .then((url: string) => {
          setSlot((_file) =>
            _file?.file === file ? { ..._file, url, status: "success" } : _file
          );
          setFileUploadStatus(() => `File ${file.path} was uploaded`);
        })
        .catch((error) => {
          console.error(error);
          setSlot((_file) =>
            _file?.file === file ? { ..._file, status: "error" } : _file
          );
        });
      setSlot({
        file,
        status: "uploading",
        progress: 0,
        id: nanoid(),
      });
    },
    onDropRejected: handleRejectedUpload,
  });

  return (
    <>
      {slot && (
        <UploadedFileCard
          {...slot}
          onClick={() => {
            setSlot(undefined);
            setFileUploadStatus(() => `${slot?.file.path} was deleted`);
          }}
        />
      )}
      <Dropzone
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        isDragActive={isDragActive}
        fileUploadStatus={fileUploadStatus}
      />
    </>
  );
}
