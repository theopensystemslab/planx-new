import FileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Close";
import CloudUpload from "@mui/icons-material/CloudUpload";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import makeStyles from "@mui/styles/makeStyles";
import { visuallyHidden } from "@mui/utils";
import { uploadPrivateFile } from "api/upload";
import classNames from "classnames";
import ImagePreview from "components/ImagePreview";
import { nanoid } from "nanoid";
import React, { useEffect, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";

import handleRejectedUpload from "../../shared/handleRejectedUpload";

const useStyles = makeStyles((theme) => ({
  root: {
    height: theme.spacing(14),
    backgroundColor: theme.palette.background.paper,
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1.5),
    position: "relative",
    width: "100%",
    fontSize: "medium",
    zIndex: 10,
    "&::before": {
      content: "''",
      position: "absolute",
      left: -theme.spacing(0.75),
      top: -theme.spacing(0.75),
      width: `calc(100% + ${theme.spacing(1.5)})`,
      height: `calc(100% + ${theme.spacing(1.5)})`,
      display: "block",
      border: `2px dashed ${theme.palette.secondary.light}`,
      opacity: 0,
      transform: "scale(0.8)",
      zIndex: -1,
      transformOrigin: "center center",
      backgroundColor: theme.palette.background.paper,
      transition: [
        theme.transitions.create(["opacity", "transform"], {
          duration: "0.2s",
        }),
      ],
    },
  },
  dragActive: {
    backgroundColor: theme.palette.background.default,
    "&::before": {
      opacity: 1,
      transform: "scale(1)",
    },
  },
  file: {
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
  },
  deleteIcon: {
    position: "absolute",
    top: theme.spacing(1),
    right: theme.spacing(1),
  },
  filePreview: {
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
  },
  progress: {
    position: "absolute",
    height: "100%",
    left: 0,
    top: 0,
    backgroundColor: theme.palette.background.default,
    zIndex: 0,
  },
  underlinedLink: {
    textDecoration: "underline",
    color: theme.palette.primary.main,
  },
  fileSize: {
    whiteSpace: "nowrap",
  },
}));

export interface FileUpload<T extends File = any> {
  file: T;
  status: "success" | "error" | "uploading";
  progress: number;
  id: string;
  url?: string;
}
interface Props {
  setFile: (file?: FileUpload) => void;
  initialFile?: FileUpload;
}

export default function FileUpload(props: Props) {
  const [slot, setSlot] = useState<FileUpload | undefined>(props.initialFile);
  const [fileUploadStatus, setFileUploadStatus] = useState<string>();
  const MAX_UPLOAD_SIZE_MB = 30;

  useEffect(() => {
    props.setFile(slot);
  }, [props.setFile, slot]);
  const classes = useStyles();
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
    },
    maxSize: MAX_UPLOAD_SIZE_MB * 1e6,
    multiple: false,
    onDrop: ([file]: FileWithPath[]) => {
      // XXX: This is a non-blocking promise chain
      uploadPrivateFile(file, {
        onProgress: (progress) => {
          setSlot((_file: any) => ({ ..._file, progress }));
        },
      })
        .then((url) => {
          setSlot((_file: any) => ({ ..._file, url, status: "success" }));
          setFileUploadStatus(() => `File ${file.path} was uploaded`);
        })
        .catch((error) => {
          console.error(error);
          setSlot((_file: any) => ({ ..._file, status: "error" }));
        });
      setSlot({
        file,
        status: "uploading",
        progress: 0,
        id: nanoid(),
      });
    },
    onDropRejected: handleRejectedUpload,
  });

  return (
    <>
      {slot && (
        <Box className={classes.file}>
          <IconButton
            size="small"
            className={classes.deleteIcon}
            aria-label={`Delete ${slot?.file.path}`}
            title={`Delete ${slot?.file.path}`}
            onClick={() => {
              setSlot(undefined);
              setFileUploadStatus(() => `${slot?.file.path} was deleted`);
            }}
          >
            <DeleteIcon />
          </IconButton>
          <Box
            className={classes.progress}
            width={`${Math.min(Math.ceil(slot?.progress * 100), 100)}%`}
            role="progressbar"
            aria-valuenow={slot?.progress * 100 || 0}
          />
          <Box className={classes.filePreview}>
            {slot?.file instanceof File &&
            slot?.file?.type?.includes("image") ? (
              <ImagePreview file={slot?.file} />
            ) : (
              <FileIcon />
            )}
          </Box>
          <Box flexGrow={1}>
            <Box
              fontSize="caption.fontSize"
              fontWeight={700}
              color="text.secondary"
            >
              File
            </Box>
            {slot?.file.path}
          </Box>
          <Box
            color="text.secondary"
            alignSelf="flex-end"
            className={classes.fileSize}
          >
            {formatBytes(slot?.file.size)}
          </Box>
        </Box>
      )}
      {fileUploadStatus && (
        <p role="status" style={visuallyHidden}>
          {fileUploadStatus}
        </p>
      )}
      <ButtonBase
        className={classNames(classes.root, isDragActive && classes.dragActive)}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <Box pl={3} pr={4} color="text.secondary">
          <CloudUpload />
        </Box>
        <Box flexGrow={1}>
          <Box>
            {isDragActive ? (
              "Drop the files here"
            ) : (
              <>
                Drag files here or{" "}
                <span className={classes.underlinedLink}>choose a file</span>
              </>
            )}
          </Box>
          <Box color="text.secondary">pdf, jpg or png</Box>
        </Box>
        <Box color="text.secondary" alignSelf="flex-end">
          max size 30MB
        </Box>
      </ButtonBase>
    </>
  );
}

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
