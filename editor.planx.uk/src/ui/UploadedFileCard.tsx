import FileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import ImagePreview from "components/ImagePreview";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

interface FileSlot {
  path: string;
  size: number;
} // is this File?

interface Props {
  id: string;
  file: FileSlot; // TODO: Tighten this up
  progress: number;
  url?: string;
  index?: number;
  onClick: any;
}

const Root = styled(Box)(({ theme }) => ({
  position: "relative",
  height: theme.spacing(14),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.background.paper}`,
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(1.5),
  marginBottom: theme.spacing(2),
  "& > *": {
    zIndex: 1,
  },
}));

const FilePreview = styled(Box)(({ theme }) => ({
  height: theme.spacing(14),
  width: theme.spacing(14),
  marginLeft: -theme.spacing(1.5),
  marginRight: theme.spacing(1.5),
  opacity: 0.5,
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

const DeleteIconButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(1),
  right: theme.spacing(1),
}));

const ProgressBar = styled(Box)(({ theme }) => ({
  position: "absolute",
  height: "100%",
  left: 0,
  top: 0,
  backgroundColor: theme.palette.background.default,
  zIndex: 0,
}));

const FileSize = styled(Box)(({ theme }) => ({
  whiteSpace: "nowrap",
  color: theme.palette.text.secondary,
  alignSelf: "flex-end",
}));

export const UploadedFileCard: React.FC<Props> = ({
  file,
  progress,
  url,
  index,
  onClick,
}) => (
  <Root>
    <DeleteIconButton
      size="small"
      aria-label={`Delete ${file.path}`}
      title={`Delete ${file.path}`}
      onClick={onClick}
    >
      <DeleteIcon />
    </DeleteIconButton>
    <ProgressBar
      width={`${Math.min(Math.ceil(progress * 100), 100)}%`}
      role="progressbar"
      aria-valuenow={progress * 100 || 0}
    />
    <FilePreview>
      {file instanceof File && file?.type?.includes("image") ? (
        <ImagePreview file={file} url={url} />
      ) : (
        <FileIcon />
      )}
    </FilePreview>
    <Box flexGrow={1}>
      <Box
        fontSize="body2.fontSize"
        fontWeight={FONT_WEIGHT_SEMI_BOLD}
        color="text.secondary"
      >
        File {index !== undefined && index + 1}
      </Box>
      {file.path}
    </Box>
    <FileSize>{formatBytes(file.size)}</FileSize>
  </Root>
);

function formatBytes(a: any, b = 2) {
  if (0 === a) return "0 Bytes";
  const c = 0 > b ? 0 : b,
    d = Math.floor(Math.log(a) / Math.log(1024));
  return (
    parseFloat((a / Math.pow(1024, d)).toFixed(c)) +
    " " +
    ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"][d]
  );
}
