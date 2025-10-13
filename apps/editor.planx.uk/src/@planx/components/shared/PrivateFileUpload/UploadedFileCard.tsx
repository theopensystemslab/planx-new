import FileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Delete";
import Box, { BoxProps } from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
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
  tags?: string[];
  FileCardProps?: BoxProps;
}

const FileCard = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.border.main}`,
  position: "relative",
  height: "auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: theme.spacing(1),
  [theme.breakpoints.up("md")]: {
    flexDirection: "row",
    alignItems: "center",
  },
  padding: theme.spacing(1, 1.5, 0.5),
  "& > *": {
    zIndex: 1,
  },
}));

const FilePreview = styled(Box)(({ theme }) => ({
  height: theme.spacing(10),
  width: theme.spacing(10),
  marginLeft: theme.spacing(-1),
  opacity: 0.75,
  position: "relative",
  overflow: "hidden",
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

const TagRoot = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.border.main}`,
  borderTop: "none",
  display: "flex",
  justifyContent: "space-between",
  flexWrap: "wrap",
  alignItems: "center",
  padding: theme.spacing(1),
}));

export const UploadedFileCard: React.FC<Props> = ({
  file,
  progress,
  url,
  removeFile,
  onChange,
  tags,
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
            </Box>
          </Box>
          {removeFile && (
            <IconButton
              size="small"
              title={`Delete ${file.name}`}
              onClick={removeFile}
              sx={{ gap: "3px" }}
              data-testid={`delete-${file.name}`}
            >
              <DeleteIcon color="warning" />
              Delete <span style={visuallyHidden}>{file.name}</span>
            </IconButton>
          )}
        </FileCard>
        {tags && (
          <TagRoot>
            <List sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {tags.map((tag) => (
                <ListItem key={tag} disablePadding sx={{ width: "auto" }}>
                  <Chip
                    label={tag}
                    variant="uploadedFileTag"
                    size="small"
                    data-testid="uploaded-file-chip"
                  />
                </ListItem>
              ))}
            </List>
            <Box sx={{ marginLeft: "auto" }}>
              <Link
                onClick={() => onChange && onChange()}
                sx={{
                  fontFamily: "inherit",
                  fontSize: "inherit",
                }}
                component="button"
                variant="body2"
              >
                Change
                <Box sx={visuallyHidden} component="span">
                  the list of what file {file.name} shows
                </Box>
              </Link>
            </Box>
          </TagRoot>
        )}
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
