import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { FileUploadSlot } from "@planx/components/FileUpload/model";
import React, { useEffect, useRef } from "react";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import { UploadedFileCard } from "../../shared/PrivateFileUpload/UploadedFileCard";
import { FileList } from "../model";
import { SelectMultipleFileTypes } from "./SelectMultipleFileTypes";

const Root = styled(Box)(({ theme }) => ({
  scrollMarginTop: theme.spacing(2),
}));

interface Props {
  slot: FileUploadSlot;
  errors: Record<string, string> | undefined;
  fileList: FileList;
  setFileList: (value: React.SetStateAction<FileList>) => void;
  removeFile: (slot: FileUploadSlot) => void;
  selectedSlotId: string | null;
}

export const FileCard: React.FC<Props> = ({
  slot,
  errors,
  removeFile,
  fileList,
  setFileList,
  selectedSlotId,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedSlotId === slot.id && ref.current) {
      ref.current.scrollIntoView({
        behavior: "instant",
        block: "start",
      });
    }
  }, [selectedSlotId, slot.id]);

  return (
    <Root ref={ref}>
      <ErrorWrapper error={errors?.[slot.id]}>
        <>
          <UploadedFileCard
            {...slot}
            key={slot.id}
            removeFile={() => removeFile(slot)}
            FileCardProps={{
              sx: { borderBottom: "none" },
            }}
          />
          <SelectMultipleFileTypes
            uploadedFile={slot}
            fileList={fileList}
            setFileList={setFileList}
          />
        </>
      </ErrorWrapper>
    </Root>
  );
};
