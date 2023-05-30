import CloudUpload from "@mui/icons-material/CloudUpload";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import makeStyles from "@mui/styles/makeStyles";
import { visuallyHidden } from "@mui/utils";
import { uploadPrivateFile } from "api/upload";
import classNames from "classnames";
import { nanoid } from "nanoid";
import React, { useEffect, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { UploadedFileCard } from "ui/UploadedFileCard";

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
  underlinedLink: {
    textDecoration: "underline",
    color: theme.palette.primary.main,
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
        <UploadedFileCard
          {...slot}
          onClick={() => {
            setSlot(undefined);
            setFileUploadStatus(() => `${slot?.file.path} was deleted`);
          }}
        />
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
        <input data-testid="upload-boundary-input" {...getInputProps()} />
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
