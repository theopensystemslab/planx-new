import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import FileIcon from "@material-ui/icons/AttachFile";
import DeleteIcon from "@material-ui/icons/Close";
import CloudUpload from "@material-ui/icons/CloudUpload";
import { visuallyHidden } from "@material-ui/utils";
import { uploadFile } from "api/upload";
import classNames from "classnames";
import { nanoid } from "nanoid";
import React, { useEffect, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";

import handleRejectedUpload from "../../shared/handleRejectedUpload";

const useStyles = makeStyles((theme) => ({
  root: {
    height: theme.spacing(14),
    backgroundColor: theme.palette.background.paper,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(1.5),
    position: "relative",
    zIndex: 10,
    "&:focus-visible": {
      outline: `2px solid ${theme.palette.secondary.dark}`,
    },
    "&::before": {
      content: "''",
      position: "absolute",
      left: -theme.spacing(0.75),
      top: -theme.spacing(0.75),
      width: `calc(100% + ${theme.spacing(1.5)}px)`,
      height: `calc(100% + ${theme.spacing(1.5)}px)`,
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
    accept: ["image/jpeg", "image/png", "application/pdf"],
    maxSize: MAX_UPLOAD_SIZE_MB * 1e6,
    multiple: false,
    onDrop: ([file]: FileWithPath[]) => {
      // XXX: This is a non-blocking promise chain
      uploadFile(file, {
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
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={slot?.progress || 0}
          />
          <Box className={classes.filePreview}>
            {slot?.file.type.includes("image") ? (
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
      <div
        className={classNames(classes.root, isDragActive && classes.dragActive)}
        role="button"
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
      </div>
    </>
  );
}

function ImagePreview({ file }: any) {
  const { current: url } = React.useRef(URL.createObjectURL(file));
  useEffect(() => {
    return () => {
      // Cleanup to free up memory
      URL.revokeObjectURL(url);
    };
  }, [url]);
  return <img src={url} alt="" />;
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
