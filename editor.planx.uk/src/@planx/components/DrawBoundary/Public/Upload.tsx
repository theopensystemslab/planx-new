import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import FileIcon from "@material-ui/icons/AttachFile";
import DeleteIcon from "@material-ui/icons/Close";
import CloudUpload from "@material-ui/icons/CloudUpload";
import { uploadFile } from "api/upload";
import classNames from "classnames";
import { nanoid } from "nanoid";
import React, { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

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
    "&:focus": {
      outline: "none",
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
}));

export default function FileUpload(props: any) {
  const MAX_UPLOAD_SIZE_MB = 30;

  const [slot, setSlot] = useState<any>();
  const handleSubmit = () => {
    // url: slot.url,
    // filename: slot.file.path,
  };
  useEffect(() => {
    props.setUrl(slot?.url);
  }, [props.setUrl, slot]);
  const classes = useStyles();
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ["image/jpeg", "image/png", "application/pdf"],
    maxSize: MAX_UPLOAD_SIZE_MB * 1e6,
    multiple: false,
    onDrop: ([file]) => {
      // XXX: This is a non-blocking promise chain
      uploadFile(file, {
        onProgress: (progress) => {
          setSlot((_file: any) => ({ ..._file, progress }));
        },
      })
        .then((url) => {
          setSlot((_file: any) => ({ ..._file, url, status: "success" }));
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

  if (!slot) {
    return (
      <div
        className={classNames(classes.root, isDragActive && classes.dragActive)}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <Box pl={3} pr={4} color="text.secondary">
          <CloudUpload />
        </Box>
        <Box flexGrow={1}>
          <Box>
            {isDragActive
              ? "Drop the files here"
              : "Drop here or click to choose file"}
          </Box>
          <Box color="text.secondary">pdf, jpg or png</Box>
        </Box>
        <Box color="text.secondary" alignSelf="flex-end">
          max size 30MB
        </Box>
      </div>
    );
  }
  return (
    <Box className={classes.file}>
      <IconButton
        size="small"
        className={classes.deleteIcon}
        onClick={() => {
          setSlot(undefined);
        }}
      >
        <DeleteIcon />
      </IconButton>
      <Box
        className={classes.progress}
        width={`${Math.min(Math.ceil(slot.progress * 100), 100)}%`}
      />
      <Box className={classes.filePreview}>
        <FileIcon />
      </Box>
      <Box flexGrow={1}>
        <Box
          fontSize="caption.fontSize"
          fontWeight={700}
          color="text.secondary"
        >
          File
        </Box>
        {slot.file.path}
      </Box>
      <Box color="text.secondary" alignSelf="flex-end">
        {formatBytes(slot.file.size)}
      </Box>
    </Box>
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
