import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { styled } from "@mui/material/styles";
import { FileUploadSlot } from "@planx/components/FileUpload/model";
import React, { useRef } from "react";
import CheckCircleIcon from "ui/icons/CheckCircle";
import ErrorWrapper from "ui/shared/ErrorWrapper";

import { UploadedFileCard } from "../../shared/PrivateFileUpload/UploadedFileCard";
import { FileList, getTagsForSlot } from "../model";
import { SelectMultipleFileTypes } from "./SelectMultipleFileTypes";

const Root = styled(Box)(({ theme }) => ({
  scrollMarginTop: theme.spacing(2),
}));

const LabelsRow = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  padding: theme.spacing(1),
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
    if (hasLabels) return "Edit labels";
    return "Add labels";
  };

  const getChangeIcon = () => {
    if (hasLabels) return <EditIcon />;
    return <AddIcon />;
  };

  return (
    <Root ref={ref}>
      <ErrorWrapper error={error} id={slot.id}>
        <>
          <UploadedFileCard
            {...slot}
            hideChangeButton={isExpanded}
            changeLabel={getChangeLabel()}
            changeIcon={getChangeIcon()}
            onChange={() => onExpand(slot.id)}
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
              onSave={() => onSave(slot.id)}
            />
          </Collapse>
          {!isExpanded && hasLabels && (
            <LabelsRow>
              <List
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  p: 0,
                }}
              >
                {tags.map((tag) => (
                  <ListItem key={tag} disablePadding sx={{ width: "auto" }}>
                    <Chip
                      label={tag}
                      variant="uploadedFileTag"
                      data-testid="uploaded-file-chip"
                      icon={<CheckCircleIcon />}
                      sx={{
                        backgroundColor: "#E6F3E6",
                        color: "text.primary",
                        border: "1px solid rgba(0, 0, 0, 0.25)",
                        "& .MuiChip-icon": {
                          color: "success.main",
                        },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </LabelsRow>
          )}
        </>
      </ErrorWrapper>
    </Root>
  );
};
