import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import { styled } from "@mui/material/styles";
import { FileUploadSlot } from "@planx/components/FileUpload/model";
import React, { useRef } from "react";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import { UploadedFileCard } from "../../shared/PrivateFileUpload/UploadedFileCard";
import { FileList, getTagsForSlot } from "../model";
import { SelectMultipleFileTypes } from "./SelectMultipleFileTypes";

const Root = styled(Box)(({ theme }) => ({
  scrollMarginTop: theme.spacing(2),
}));

interface FileAccordionCardProps {
  slot: FileUploadSlot;
  isExpanded: boolean;
  onExpand: (slotId: string) => void;
  onSave: (slotId: string) => void;
  onRemove: (slot: FileUploadSlot) => void;
  fileList: FileList;
  setFileList: (value: React.SetStateAction<FileList>) => void;
  error?: string;
  showDrawingNumber?: boolean;
  drawingNumber?: string;
  onDrawingNumberChange?: (value: string) => void;
}

export const FileAccordionCard: React.FC<FileAccordionCardProps> = ({
  slot,
  isExpanded,
  onExpand,
  onSave,
  onRemove,
  fileList,
  setFileList,
  error,
  showDrawingNumber,
  drawingNumber,
  onDrawingNumberChange,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleEntered = () => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const tags = getTagsForSlot(slot.id, fileList);

  return (
    <Root ref={ref}>
      <ErrorWrapper error={error} id={slot.id}>
        <>
          <UploadedFileCard
            {...slot}
            tags={isExpanded ? undefined : tags}
            onChange={
              isExpanded ? () => onSave(slot.id) : () => onExpand(slot.id)
            }
            changeLabel={isExpanded ? "Save" : "Edit"}
            removeFile={() => onRemove(slot)}
          />
          <Collapse in={isExpanded} unmountOnExit onEntered={handleEntered}>
            <SelectMultipleFileTypes
              uploadedFile={slot}
              fileList={fileList}
              setFileList={setFileList}
              showDrawingNumber={showDrawingNumber}
              drawingNumber={drawingNumber}
              onDrawingNumberChange={onDrawingNumberChange}
            />
          </Collapse>
        </>
      </ErrorWrapper>
    </Root>
  );
};
