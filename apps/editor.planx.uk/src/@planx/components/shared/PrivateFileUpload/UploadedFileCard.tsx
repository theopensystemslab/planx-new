import FileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Delete";
import Box, { BoxProps } from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { FileUploadSlot } from "@planx/components/FileUpload/model";
import ImagePreview from "components/ImagePreview";
import React from "react";
import ErrorWrapper from "ui/shared/ErrorWrapper";

interface Props extends FileUploadSlot {
  removeFile: () => void;
  onChange?: () => void;
  // New accordion UI props
  changeLabel?: string;
  changeIcon?: React.ReactNode;
  hideChangeButton?: boolean;
  drawingNumber?: string;
  // Legacy modal UI props
  tags?: string[];
  FileCardProps?: BoxProps;
}

const FileCard = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.border.main}`,
  backgroundColor: theme.palette.background.paper,
  position: "relative",
  height: "auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: theme.spacing(2),
  [theme.breakpoints.up("md")]: {
    flexDirection: "row",
    alignItems: "center",
  },
  padding: theme.spacing(1.5),
  "& > *": {
    zIndex: 1,
  },
}));

const FilePreview = styled(Box)(({ theme }) => ({
  height: theme.spacing(9),
  width: theme.spacing(9),
  position: "relative",
  overflow: "hidden",
  backgroundColor: theme.palette.background.default,
  "& img": {
    position: "absolute",
    width: "100%",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
  },
  "& svg": {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: theme.spacing(5),
    height: theme.spacing(5),
  },
}));

const ProgressBar = styled(Box)(({ theme }) => ({
  position: "absolute",
  height: theme.spacing(0.4),
  left: 0,
  top: 0,
  backgroundColor: theme.palette.border.input,
  zIndex: 0,
}));

const FileSize = styled(Typography)(({ theme }) => ({
  whiteSpace: "nowrap",
  color: theme.palette.text.secondary,
  alignSelf: "flex-end",
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  flexShrink: 0,
}));

export const UploadedFileCard: React.FC<Props> = ({
  file,
  progress,
  url,
  removeFile,
  onChange,
  changeLabel = "Edit",
  changeIcon,
  hideChangeButton,
  drawingNumber,
  status,
  FileCardProps,
}) => (
  <Box>
    <ErrorWrapper
      error={
        status === "error"
          ? "Upload failed, please remove file and try again"
          : undefined
      }
    >
      <>
        <FileCard {...FileCardProps}>
          <ProgressBar
            width={`${Math.min(Math.ceil(progress * 100), 100)}%`}
            role="progressbar"
            aria-valuenow={progress * 100 || 0}
            aria-label={`Upload progress of file ${file.name}`}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              gap: 1,
              alignItems: "center",
              width: "100%",
            }}
          >
            <FilePreview>
              {file instanceof File && file?.type?.includes("image") ? (
                <ImagePreview file={file} url={url} />
              ) : (
                <FileIcon />
              )}
            </FilePreview>
            <Box mr={2}>
              <Typography
                variant="body1"
                pb="0.25em"
                sx={{ overflowWrap: "break-word", wordBreak: "break-all" }}
                data-testid={file.name}
              >
                {file.name}
              </Typography>
              <FileSize variant="body2">{formatBytes(file.size)}</FileSize>
              {drawingNumber && (
                <Typography variant="body2" color="text.secondary" pt="0.25em">
                  Drawing number: {drawingNumber}
                </Typography>
              )}
            </Box>
          </Box>
          <ActionButtons>
            {!hideChangeButton && onChange && (
              <Button
                variant="contained"
                color="secondary"
                startIcon={changeIcon}
                sx={{
                  minWidth: 120,
                  backgroundColor: "white",
                }}
                size="small"
                onClick={onChange}
                data-testid={`${changeLabel.toLowerCase().replace(/\s/g, "-")}-${file.name}`}
              >
                {changeLabel}
                <Box sx={visuallyHidden} component="span">
                  {` what ${file.name} shows`}
                </Box>
              </Button>
            )}
            <Button
              size="small"
              title={`Delete ${file.name}`}
              onClick={removeFile}
              sx={{ gap: 1, backgroundColor: "white" }}
              data-testid={`delete-${file.name}`}
              variant="contained"
              color="secondary"
            >
              <DeleteIcon color="warning" fontSize="small" />
              Remove <span style={visuallyHidden}>{file.name}</span>
            </Button>
          </ActionButtons>
        </FileCard>
      </>
    </ErrorWrapper>
  </Box>
);

function formatBytes(a: number, b = 2) {
  if (0 === a) return "0 Bytes";
  const c = 0 > b ? 0 : b,
    d = Math.floor(Math.log(a) / Math.log(1024));
  return (
    parseFloat((a / Math.pow(1024, d)).toFixed(c)) +
    " " +
    ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]
  );
}
