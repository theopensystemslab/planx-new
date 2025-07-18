import FileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import Box from "@mui/material/Box";
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
}

const Root = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
  marginTop: theme.spacing(5),
}));

const FileCard = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.border.main}`,
  position: "relative",
  height: "auto",
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0.5, 1.5),
  "& > *": {
    zIndex: 1,
  },
}));

const FilePreview = styled(Box)(({ theme }) => ({
  height: theme.spacing(10),
  width: theme.spacing(10),
  marginLeft: theme.spacing(-1),
  marginRight: theme.spacing(1.5),
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
  height: "100%",
  left: 0,
  top: 0,
  backgroundColor: theme.palette.background.default,
  zIndex: 0,
}));

const FileSize = styled(Typography)(({ theme }) => ({
  whiteSpace: "nowrap",
  color: theme.palette.text.secondary,
  alignSelf: "flex-end",
}));

const TagRoot = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.border.main}`,
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
}) => (
  <Root>
    <ErrorWrapper
      error={
        status === "error"
          ? "Upload failed, please remove file and try again"
          : undefined
      }
    >
      <>
        <FileCard>
          <ProgressBar
            width={`${Math.min(Math.ceil(progress * 100), 100)}%`}
            role="progressbar"
            aria-valuenow={progress * 100 || 0}
            aria-label={file.name}
          />
          <FilePreview>
            {file instanceof File && file?.type?.includes("image") ? (
              <ImagePreview file={file} url={url} />
            ) : (
              <FileIcon />
            )}
          </FilePreview>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Box mr={2}>
              <Typography
                variant="body1"
                pb="0.25em"
                sx={{ overflowWrap: "break-word", wordBreak: "break-all" }}
              >
                {file.name}
              </Typography>
              <FileSize variant="body2">{formatBytes(file.size)}</FileSize>
            </Box>
            {removeFile && (
              <IconButton
                size="small"
                aria-label={`Delete ${file.name}`}
                title={`Delete ${file.name}`}
                onClick={removeFile}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
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
  </Root>
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
