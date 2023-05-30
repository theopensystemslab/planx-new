import { uploadPrivateFile } from "api/upload";
import { nanoid } from "nanoid";
import React, { useEffect, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Dropzone } from "ui/Dropzone";
import { UploadedFileCard } from "ui/UploadedFileCard";

import handleRejectedUpload from "../../shared/handleRejectedUpload";

export interface FileUpload<T extends File = any> {
  file: T;
  status: "success" | "error" | "uploading";
  progress: number;
  id: string;
  url?: string;
}

interface Props {
  setFile: (file?: FileUpload) => void;
  initialFile?: FileUpload;
}

export default function FileUpload(props: Props) {
  const [slot, setSlot] = useState<FileUpload | undefined>(props.initialFile);
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
          setSlot((_file: any) => ({ ..._file, progress }));
        },
      })
        .then((url) => {
          setSlot((_file: any) => ({ ..._file, url, status: "success" }));
          setFileUploadStatus(() => `File ${file.path} was uploaded`);
        })
        .catch((error) => {
          console.error(error);
          setSlot((_file: any) => ({ ..._file, status: "error" }));
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
