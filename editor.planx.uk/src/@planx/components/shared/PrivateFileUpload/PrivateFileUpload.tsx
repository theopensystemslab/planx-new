import { FileUploadSlot } from "@planx/components/FileUpload/model";
import { Dropzone } from "@planx/components/shared/PrivateFileUpload/Dropzone";
import { UploadedFileCard } from "@planx/components/shared/PrivateFileUpload/UploadedFileCard";
import React, { useState } from "react";

import { FileStatus } from "./FileStatus";

interface PrivateFileUploadProps {
  slots: FileUploadSlot[];
  setSlots: React.Dispatch<React.SetStateAction<FileUploadSlot[]>>;
  maxFiles?: number;
}

export const PrivateFileUpload: React.FC<PrivateFileUploadProps> = ({
  slots,
  setSlots,
  maxFiles,
}) => {
  const [fileUploadStatus, setFileUploadStatus] = useState<string | undefined>(
    undefined,
  );
  const hasEmptySlots = !maxFiles || maxFiles > slots.length;

  return (
    <>
      {hasEmptySlots && (
        <Dropzone
          slots={slots}
          setSlots={setSlots}
          setFileUploadStatus={setFileUploadStatus}
          maxFiles={maxFiles}
        />
      )}
      {slots.map((slot) => {
        return (
          <UploadedFileCard
            {...slot}
            key={slot.id}
            removeFile={() => {
              setSlots(
                slots.filter((currentSlot) => currentSlot.file !== slot.file),
              );
              setFileUploadStatus(`${slot.file.path} was deleted`);
            }}
          />
        );
      })}
      <FileStatus status={fileUploadStatus} />
    </>
  );
};
