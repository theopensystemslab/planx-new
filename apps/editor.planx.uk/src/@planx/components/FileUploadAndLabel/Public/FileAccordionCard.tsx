import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import { styled } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import { FileUploadSlot } from "@planx/components/FileUpload/model";
import React, { useRef } from "react";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import { UploadedFileCard } from "../../shared/PrivateFileUpload/UploadedFileCard";
import { FileList, getTagsForSlot } from "../model";
import { SelectMultipleFileTypes } from "./SelectMultipleFileTypes";

const Root = styled(Box)(({ theme }) => ({
  scrollMarginTop: theme.spacing(2),
}));

const ActionBar = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  border: `1px solid ${theme.palette.border.main}`,
  borderTop: "none",
  backgroundColor: theme.palette.background.paper,
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
  const hasLabels = tags.length > 0;

  const getChangeLabel = () => {
    if (isExpanded) return "Save";
    return hasLabels ? "Edit labels" : "Add labels";
  };

  return (
    <Root ref={ref}>
      <ErrorWrapper error={error} id={slot.id}>
        <>
          <UploadedFileCard
            {...slot}
            tags={isExpanded ? undefined : tags}
            hideChangeButton
            drawingNumber={isExpanded ? undefined : drawingNumber}
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
          <ActionBar>
            <Button
              variant="contained"
              color={isExpanded ? "prompt" : "secondary"}
              sx={{
                minWidth: 120,
                ...(!isExpanded && { backgroundColor: "white" }),
              }}
              size="small"
              onClick={
                isExpanded ? () => onSave(slot.id) : () => onExpand(slot.id)
              }
              data-testid={`${getChangeLabel().toLowerCase().replace(/\s/g, "-")}-${slot.file.name}`}
            >
              {getChangeLabel()}
              <Box sx={visuallyHidden} component="span">
                {isExpanded
                  ? ` for ${slot.file.name}`
                  : ` what ${slot.file.name} shows`}
              </Box>
            </Button>
          </ActionBar>
        </>
      </ErrorWrapper>
    </Root>
  );
};
