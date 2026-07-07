import Stack from "@mui/material/Stack";
import type { FileUploadSlot } from "@planx/components/FileUpload/model";
import { Dropzone } from "@planx/components/shared/PrivateFileUpload/Dropzone";
import { UploadedFileCard } from "@planx/components/shared/PrivateFileUpload/UploadedFileCard";
import React, { useState } from "react";

import { FileStatus } from "./FileStatus";

interface PrivateFileUploadProps {
  slots: FileUploadSlot[];
  setSlots: React.Dispatch<React.SetStateAction<FileUploadSlot[]>>;
  maxFiles?: number;
  showDrawingNumber?: boolean;
}

export const PrivateFileUpload: React.FC<PrivateFileUploadProps> = ({
  slots,
  setSlots,
  maxFiles,
  showDrawingNumber = false,
}) => {
  const [fileUploadStatus, setFileUploadStatus] = useState<string | undefined>(
    undefined,
  );
  const hasEmptySlots = !maxFiles || maxFiles > slots.length;

  const onDrawingNumberChange = (slotId: string, drawingNumber: string) => {
    setSlots((prevSlots) =>
      prevSlots.map((slot) =>
        slot.id === slotId ? { ...slot, drawingNumber } : slot,
      ),
    );
  };

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
      <Stack spacing={2} sx={{ marginTop: 2 }}>
        {slots.map((slot) => (
          <UploadedFileCard
            {...slot}
            showDrawingNumber={showDrawingNumber}
            onDrawingNumberChange={onDrawingNumberChange}
            key={slot.id}
            removeFile={() => {
              setSlots(
                slots.filter((currentSlot) => currentSlot.file !== slot.file),
              );
              setFileUploadStatus(`${slot.file.path} was deleted`);
            }}
          />
        ))}
      </Stack>
      <FileStatus status={fileUploadStatus} />
    </>
  );
};
